package com.example.edustream.service;

import com.example.edustream.dto.request.*;
import com.example.edustream.dto.response.NotificationResponseDto;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.dto.response.VideoResponseDto;
import com.example.edustream.dto.response.VideoUploadResponseDto;
import com.example.edustream.entity.*;
import com.example.edustream.entity.enums.NotificationType;
import com.example.edustream.entity.enums.UploadStatus;
import com.example.edustream.entity.enums.VideoStatus;
import com.example.edustream.entity.enums.VideoType;
import com.example.edustream.exception.ResourceNotFoundException;
import com.example.edustream.mapper.VideoMapper;
import com.example.edustream.repository.*;
import com.example.edustream.util.StringUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final VideoRepository videoRepository;
    private final CategoryRepository categoryRepository;
    private final HashtagRepository hashtagRepository;
    private final VideoMapper videoMapper;
    private final NotificationService notificationService;
    private final SubscriptionRepository subscriptionRepository;
    private final OnlineUserService onlineUserService;
    private final SimpMessagingTemplate messagingTemplate;
    private final S3Service s3Service;
    private final ViolationService  violationService;
    private final VideoLikeRepository  videoLikeRepository;

    @Value("${aws.s3.bucket}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    @Transactional
    public VideoUploadResponseDto createVideoUpload(VideoUploadRequestDto request, UserPrincipal userPrincipal) {
        User user = userPrincipal.getUser();

        // 1. Tạo unique object key cho S3 để tránh trùng lặp tên file
        String uniqueFileName = java.util.UUID.randomUUID().toString() + "_" + request.getFileName();
        String objectKey = "videos/" + uniqueFileName;

        // 2. Tạo Video Entity
        Video video = videoMapper.toVideo(request);

        // Lưu URL public của file S3 (đây là link sau khi upload xong sẽ dùng để xem)
        String publicVideoUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, objectKey);
        video.setVideoUrl(publicVideoUrl);
        video.setUser(user);

        // 2. Xử lý thông tin Thumbnail (Nếu có)
        String thumbnailPresignedUrl = null;
        if (request.getThumbnailFileName() != null && request.getThumbnailContentType() != null) {
            // Tạo key riêng cho ảnh trong thư mục thumbnails/
            String uniqueThumbName = java.util.UUID.randomUUID().toString() + "_" + request.getThumbnailFileName();
            String thumbObjectKey = "thumbnails/" + uniqueThumbName;

            // Lưu link public của ảnh vào DB
            String publicThumbUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, thumbObjectKey);
            video.setThumbnail(publicThumbUrl);

            // Sinh Presigned URL cho Frontend upload ảnh
            thumbnailPresignedUrl = s3Service.generatePresignedUrl(thumbObjectKey, request.getThumbnailContentType());
        }


        processCategoriesAndHashtags(video, request.getCategories(), request.getHashtags());
        Video savedVideo = videoRepository.save(video);

        String presignedUrl = s3Service.generatePresignedUrl(objectKey, request.getContentType());

        return new VideoUploadResponseDto(videoMapper.toVideoResponseDto(savedVideo), presignedUrl, thumbnailPresignedUrl);
    }
    @Transactional
    public VideoResponseDto createVideoYoutube(VideoYoutubeRequestDto request, UserPrincipal userPrincipal) {
        User user = userPrincipal.getUser();
        Video video = videoMapper.toVideo(request);
        video.setUser(user);

        processCategoriesAndHashtags(video, request.getCategories(), request.getHashtags());

        Video savedVideo = videoRepository.save(video);
        notifySubscribers(user, savedVideo.getId(), savedVideo.getTitle());
        return videoMapper.toVideoResponseDto(savedVideo);
    }
    private void processCategoriesAndHashtags(Video video, List<String> categoryNames, List<String> hashtagNames) {
        // 1. Xử lý Categories
        if (categoryNames != null) {
            Set<Category> categories = categoryNames.stream().map(name ->
                    categoryRepository.findByCategoryName(name)
                            .orElseGet(() -> {
                                Category newCat = new Category();
                                newCat.setCategoryName(name);
                                newCat.setSlugName(StringUtil.generateSlug(name));
                                return categoryRepository.save(newCat);
                            })
            ).collect(Collectors.toSet());
            video.setCategories(categories);
        }

        // 2. Xử lý Hashtags
        if (hashtagNames != null) {
            Set<Hashtag> hashtags = hashtagNames.stream().map(name ->
                    hashtagRepository.findByHashtagName(name)
                            .orElseGet(() -> {
                                Hashtag newTag = new Hashtag();
                                newTag.setHashtagName(name);
                                return hashtagRepository.save(newTag);
                            })
            ).collect(Collectors.toSet());
            video.setHashtags(hashtags);
        }
    }
    @Transactional
    public VideoResponseDto confirmVideoUpload(Long videoId, UserPrincipal userPrincipal) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video không tồn tại với ID: " + videoId));

        if (!video.getUser().getId().equals(userPrincipal.getUser().getId())) {
            throw new IllegalArgumentException("Bạn không có quyền thao tác trên video này!");
        }

        // 3. Kiểm tra loại video và trạng thái hiện tại
        if (video.getVideoType() != VideoType.UPLOAD) {
            throw new IllegalArgumentException("Tính năng này chỉ áp dụng cho video upload hệ thống!");
        }

        if (video.getUploadStatus() == UploadStatus.PUBLISHED) {
            return videoMapper.toVideoResponseDto(video);
        }

        // 4. Cập nhật trạng thái
        video.setUploadStatus(UploadStatus.PUBLISHED);
        Video updatedVideo = videoRepository.save(video);
        notifySubscribers(userPrincipal.getUser(), updatedVideo.getId(), updatedVideo.getTitle());

        // 5. Trả về thông tin video đã được cập nhật
        return videoMapper.toVideoResponseDto(updatedVideo);
    }
    public PageResponse<VideoResponseDto> getAllVideos(int page) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());

        Page<Video> videoPage = videoRepository.findAll(pageable);

        Page<VideoResponseDto> dtoPage = videoPage.map(videoMapper::toVideoResponseDto);
        return new PageResponse<>(dtoPage);
    }
    public PageResponse<VideoResponseDto> filterVideos(VideoFilterRequestDto filterDto) {
        Sort sort = determineSort(filterDto.getSortBy());

        Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize(), sort);

        Page<Video> videoPage;

        if (filterDto.getCategory() != null && !filterDto.getCategory().isEmpty()) {
            videoPage = videoRepository.findVideosByCategory(filterDto.getCategory(), pageable);
        } else {
            videoPage = videoRepository.findAllVideosWithDetails(pageable);
        }

        Page<VideoResponseDto> dtoPage = videoPage.map(videoMapper::toVideoResponseDto);
        return new PageResponse<>(dtoPage);
    }
    private Sort determineSort(String sortBy) {
        if (sortBy == null) return Sort.by("createdAt").descending();

        return switch (sortBy.toLowerCase()) {
            case "oldest" -> Sort.by("createdAt").ascending();
            case "newest" -> Sort.by("createdAt").descending();
            case "most_viewed", "mostviewed" -> Sort.by("view").descending();
            default -> Sort.by("createdAt").descending();
        };
    }

    public PageResponse<VideoResponseDto> getVideosByCategory(String category, int page) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());

        Page<Video> videoPage = videoRepository.findVideosByCategory(category, pageable);

        Page<VideoResponseDto> dtoPage = videoPage.map(videoMapper::toVideoResponseDto);
        return new PageResponse<>(dtoPage);
    }

    public PageResponse<VideoResponseDto> getVideosByCurrentUser(UserPrincipal userPrincipal, int page) {
        User user = userPrincipal.getUser();

        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());

        Page<Video> videoPage = videoRepository.findByUser(user, pageable);

        Page<VideoResponseDto> dtoPage = videoPage.map(videoMapper::toVideoResponseDto);

        return new PageResponse<>(dtoPage);
    }

    public PageResponse<VideoResponseDto> getVideosByUsername(String username, int page) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());

        Page<Video> videoPage = videoRepository.findByUser_Username(username, pageable);

        Page<VideoResponseDto> dtoPage = videoPage.map(videoMapper::toVideoResponseDto);

        return new PageResponse<>(dtoPage);
    }

    public VideoResponseDto getVideoById(long videoId, UserPrincipal userPrincipal) {
        Video video = videoRepository.findByIdWithDetails(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video không tồn tại với ID: " + videoId));

        VideoResponseDto dto = videoMapper.toVideoResponseDto(video);

        if (userPrincipal != null) {
            boolean isLiked = videoLikeRepository.existsByUserIdAndVideoId(userPrincipal.getUser().getId(), videoId);
            dto.setLiked(isLiked);
        } else {
            dto.setLiked(false);
        }

        return dto;
    }
    @Transactional
    public VideoUploadResponseDto updateVideo(long videoId, VideoUpdateRequestDto request, UserPrincipal userPrincipal) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video không tồn tại với ID: " + videoId));

        if (!video.getUser().getId().equals(userPrincipal.getUser().getId())) {
            throw new AccessDeniedException("Bạn không có quyền cập nhật video này!");
        }

        if (request.getTitle() != null) video.setTitle(request.getTitle());
        if (request.getDescription() != null) video.setDescription(request.getDescription());
        if (request.getCategories() != null || request.getHashtags() != null) {
            processCategoriesAndHashtags(video, request.getCategories(), request.getHashtags());
        }

        String thumbnailPresignedUrl = null;
        if (request.getThumbnailFileName() != null && request.getThumbnailContentType() != null) {

            if (video.getThumbnail() != null) {
                String oldKey = extractS3KeyFromUrl(video.getThumbnail());
                if (oldKey != null) {
                    try {
                        s3Service.deleteFile(oldKey);
                    } catch (Exception e) {
                        System.err.println("Failed to delete old thumbnail: " + e.getMessage());
                    }
                }
            }

            String uniqueFileName = java.util.UUID.randomUUID() + "_" + request.getThumbnailFileName();
            String objectKey = "thumbnails/" + uniqueFileName;
            String publicUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, objectKey);

            video.setThumbnail(publicUrl);

            thumbnailPresignedUrl = s3Service.generatePresignedUrl(objectKey, request.getThumbnailContentType());
        }

        Video savedVideo = videoRepository.save(video);
        VideoResponseDto videoInfo = videoMapper.toVideoResponseDto(savedVideo);
        return new VideoUploadResponseDto(videoInfo, null, thumbnailPresignedUrl);
    }

    private String extractS3KeyFromUrl(String url) {
        if (url == null || !url.contains(".amazonaws.com/")) return null;
        try {
            return url.split(".amazonaws.com/")[1];
        } catch (Exception e) {
            return null;
        }
    }
    @Transactional
    public void deleteVideoById(long videoId, UserPrincipal userPrincipal) {

        Video video = videoRepository.findById(videoId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Video không tồn tại với ID: " + videoId));

        Long ownerId = video.getUser().getId();
        Long currentUserId = userPrincipal.getUser().getId();

        if (!ownerId.equals(currentUserId)) {
            throw new AccessDeniedException("Bạn không có quyền xoá video này!");
        }

        videoRepository.delete(video);
    }

    private void notifySubscribers(User sender, Long videoId, String videoTitle) {
        List<Subscription> subscriptions = subscriptionRepository.findByChannelId(sender.getId());

        for (Subscription subscription : subscriptions) {
            Long subscriberId = subscription.getSubscriber().getId();

            // 1. Tạo notification trong DB
            NotificationRequestDto dto = new NotificationRequestDto();
            dto.setSenderId(sender.getId());
            dto.setRecipientId(subscriberId);
            dto.setReferenceId(videoId);
            dto.setNotificationType(NotificationType.VIDEO);
            dto.setMessage(sender.getFullName() + " vừa đăng tải video " + videoTitle);

            NotificationResponseDto notificationResponse = notificationService.createNotification(dto);

            if (onlineUserService.isOnline(subscriberId)) {
                messagingTemplate.convertAndSend(
                        "/topic/notification/" + subscriberId,
                        notificationResponse
                );
            }
        }
    }

    @Transactional
    public void acceptVideo(Long videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video không tồn tại với ID: " + videoId));

        if (video.getVideoStatus() != VideoStatus.PENDING) {
            throw new IllegalStateException("Video này đã được xử lý trước đó!");
        }

        video.setVideoStatus(VideoStatus.ACCEPTED);

        videoRepository.save(video);
    }

    @Transactional
    public void rejectVideo(ViolationRequestDto violationRequestDto) {
        Long videoId = violationRequestDto.getVideoId();
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video không tồn tại với ID: " + videoId));

        if (video.getVideoStatus() != VideoStatus.PENDING) {
            throw new IllegalStateException("Video này đã được xử lý trước đó!");
        }

        video.setVideoStatus(VideoStatus.REJECTED);
        videoRepository.save(video);

        violationRequestDto.setUserId(video.getUser().getId());

        violationService.createViolation(violationRequestDto);
    }
    public PageResponse<VideoResponseDto> getRelatedVideos(Long videoId, int page) {
        Video currentVideo = videoRepository.findByIdWithDetails(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video không tồn tại với ID: " + videoId));

        List<String> categoryNames = currentVideo.getCategories().stream()
                .map(Category::getCategoryName)
                .collect(Collectors.toList());

        List<String> hashtagNames = currentVideo.getHashtags().stream()
                .map(Hashtag::getHashtagName)
                .collect(Collectors.toList());

        if (categoryNames.isEmpty()) categoryNames.add("");
        if (hashtagNames.isEmpty()) hashtagNames.add("");

        Long authorId = currentVideo.getUser().getId();

        List<Video> rawVideos = videoRepository.findRelatedVideosRaw(
                currentVideo.getId(),
                authorId,
                categoryNames,
                hashtagNames
        );

        java.util.function.ToIntFunction<Video> calculateScore = video -> {
            int score = 0;

            if (video.getUser() != null && video.getUser().getId().equals(authorId)) {
                score += 2;
            }

            boolean hasMatchingCategory = video.getCategories().stream()
                    .anyMatch(c -> categoryNames.contains(c.getCategoryName()));
            if (hasMatchingCategory) {
                score += 3;
            }

            boolean hasMatchingHashtag = video.getHashtags().stream()
                    .anyMatch(h -> hashtagNames.contains(h.getHashtagName()));
            if (hasMatchingHashtag) {
                score += 1;
            }

            return score;
        };

        List<Video> sortedVideos = rawVideos.stream()
                .sorted(Comparator.comparingInt(calculateScore).reversed()
                        .thenComparing(Video::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        int pageSize = 10;
        int totalElements = sortedVideos.size();
        int start = Math.min(page * pageSize, totalElements);
        int end = Math.min((page + 1) * pageSize, totalElements);

        List<Video> pagedVideos = sortedVideos.subList(start, end);

        List<VideoResponseDto> dtos = pagedVideos.stream()
                .map(videoMapper::toVideoResponseDto)
                .collect(Collectors.toList());

        Pageable pageable = PageRequest.of(page, pageSize);
        Page<VideoResponseDto> dtoPage = new PageImpl<>(dtos, pageable, totalElements);

        return new PageResponse<>(dtoPage);
    }
    @Transactional
    public VideoResponseDto toggleLikeVideo(Long videoId, UserPrincipal userPrincipal) {
        User user = userPrincipal.getUser();

        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video không tồn tại với ID: " + videoId));

        Optional<VideoLike> existingLike = videoLikeRepository.findByUserIdAndVideoId(user.getId(), videoId);

        boolean isLikedNow;

        if (existingLike.isPresent()) {
            videoLikeRepository.delete(existingLike.get());
            video.setLikeCount(Math.max(0, video.getLikeCount() - 1));
            isLikedNow = false;
        } else {
            VideoLike newLike = new VideoLike(user, video);
            videoLikeRepository.save(newLike);
            video.setLikeCount(video.getLikeCount() + 1);
            isLikedNow = true;
        }

        Video updatedVideo = videoRepository.save(video);

        VideoResponseDto responseDto = videoMapper.toVideoResponseDto(updatedVideo);
        responseDto.setLiked(isLikedNow);

        return responseDto;
    }

    public PageResponse<VideoResponseDto> searchVideos(String keyword, int page) {
        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());

        String searchKeyword = (keyword != null) ? keyword.trim() : "";
        Page<Video> videoPage = videoRepository.findByTitleContainingIgnoreCase(searchKeyword, pageable);

        Page<VideoResponseDto> dtoPage = videoPage.map(videoMapper::toVideoResponseDto);

        return new PageResponse<>(dtoPage);
    }
}