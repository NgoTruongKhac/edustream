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

// 3. Gọi S3Service để lấy Presigned URL cho VIDEO
        String presignedUrl = s3Service.generatePresignedUrl(objectKey, request.getContentType());

        return new VideoUploadResponseDto(videoMapper.toVideoResponseDto(savedVideo), presignedUrl, thumbnailPresignedUrl);
    }
    @Transactional
    public VideoResponseDto createVideoYoutube(VideoYoutubeRequestDto request, UserPrincipal userPrincipal) {
        User user = userPrincipal.getUser();
        Video video = videoMapper.toVideo(request);
        video.setUser(user);

        // --- PHẦN REFACTOR: Xử lý Hashtags & Categories (N-N) ---
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
        // 1. Tìm video theo ID
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video không tồn tại với ID: " + videoId));

        // 2. Kiểm tra quyền sở hữu: Người xác nhận phải là người tạo video
        if (!video.getUser().getId().equals(userPrincipal.getUser().getId())) {
            throw new IllegalArgumentException("Bạn không có quyền thao tác trên video này!");
            // Lưu ý: Nếu project bạn có Custom Exception cho lỗi 403 Forbidden (ví dụ AccessDeniedException), hãy dùng nó ở đây.
        }

        // 3. Kiểm tra loại video và trạng thái hiện tại
        if (video.getVideoType() != VideoType.UPLOAD) {
            throw new IllegalArgumentException("Tính năng này chỉ áp dụng cho video upload hệ thống!");
        }

        if (video.getUploadStatus() == UploadStatus.PUBLISHED) {
            // Nếu đã PUBLISHED rồi thì không cần làm gì thêm, trả về luôn
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
        // Cấu hình phân trang: 10 item/trang, sắp xếp giảm dần theo thời gian tạo
        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());

        // Lấy tất cả video
        Page<Video> videoPage = videoRepository.findAll(pageable);

        // Map sang DTO và trả về
        Page<VideoResponseDto> dtoPage = videoPage.map(videoMapper::toVideoResponseDto);
        return new PageResponse<>(dtoPage);
    }
    public PageResponse<VideoResponseDto> filterVideos(VideoFilterRequestDto filterDto) {
        // 1. Xác định cách sắp xếp từ DTO
        Sort sort = determineSort(filterDto.getSortBy());

        // 2. Cấu hình phân trang kết hợp sắp xếp động (sử dụng page và size từ DTO)
        Pageable pageable = PageRequest.of(filterDto.getPage(), filterDto.getSize(), sort);

        Page<Video> videoPage;

        // 3. Xử lý logic lọc (Có thể dùng Specification nếu logic lọc phức tạp hơn)
        if (filterDto.getCategory() != null && !filterDto.getCategory().isEmpty()) {
            videoPage = videoRepository.findVideosByCategory(filterDto.getCategory(), pageable);
        } else {
            videoPage = videoRepository.findAll(pageable); // Nếu không truyền category thì lấy hết
        }

        // 4. Map và trả về
        Page<VideoResponseDto> dtoPage = videoPage.map(videoMapper::toVideoResponseDto);
        return new PageResponse<>(dtoPage);
    }
    // Hàm Helper dùng chung để lấy ra object Sort
    private Sort determineSort(String sortBy) {
        if (sortBy == null) return Sort.by("createdAt").descending(); // Default

        return switch (sortBy.toLowerCase()) {
            case "oldest" -> Sort.by("createdAt").ascending();
            case "newest" -> Sort.by("createdAt").descending();
            default -> Sort.by("createdAt").descending(); // Fallback nếu user nhập sai
        };
    }

    public PageResponse<VideoResponseDto> getVideosByCategory(String category, int page) {
        // Cấu hình phân trang: 10 item/trang, sắp xếp giảm dần theo thời gian tạo
        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());

        // Lấy video thông qua custom query trong repository
        Page<Video> videoPage = videoRepository.findVideosByCategory(category, pageable);

        // Map sang DTO và trả về
        Page<VideoResponseDto> dtoPage = videoPage.map(videoMapper::toVideoResponseDto);
        return new PageResponse<>(dtoPage);
    }

    public PageResponse<VideoResponseDto> getVideosByCurrentUser(UserPrincipal userPrincipal, int page) {
        User user = userPrincipal.getUser();

        // 1. Cấu hình phân trang (10 item/trang, sắp xếp giảm dần theo thời gian tạo)
        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());

        // 2. Lấy Page<Video> từ cơ sở dữ liệu
        Page<Video> videoPage = videoRepository.findByUser(user, pageable);

        // 3. Chuyển đổi Page<Video> thành Page<VideoResponseDto>
        Page<VideoResponseDto> dtoPage = videoPage.map(videoMapper::toVideoResponseDto);

        // 4. Khởi tạo và trả về PageResponse thông qua constructor bạn vừa định nghĩa
        return new PageResponse<>(dtoPage);
    }

    public PageResponse<VideoResponseDto> getVideosByUsername(String username, int page) {
        // 1. Cấu hình phân trang (10 item/trang, sắp xếp giảm dần theo thời gian tạo)
        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());

        // 2. Lấy Page<Video> từ cơ sở dữ liệu dựa trên username
        Page<Video> videoPage = videoRepository.findByUser_Username(username, pageable);

        // 3. Chuyển đổi Page<Video> thành Page<VideoResponseDto>
        Page<VideoResponseDto> dtoPage = videoPage.map(videoMapper::toVideoResponseDto);

        // 4. Khởi tạo và trả về PageResponse
        return new PageResponse<>(dtoPage);
    }

    public VideoResponseDto getVideoById(long videoId, UserPrincipal userPrincipal) {
        Video video = videoRepository.findByIdWithDetails(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video không tồn tại với ID: " + videoId));

        VideoResponseDto dto = videoMapper.toVideoResponseDto(video);

        // Nếu user đã đăng nhập, kiểm tra xem họ đã thích video này chưa
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
        // 1. Tìm video và kiểm tra quyền sở hữu
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video không tồn tại với ID: " + videoId));

        if (!video.getUser().getId().equals(userPrincipal.getUser().getId())) {
            throw new AccessDeniedException("Bạn không có quyền cập nhật video này!");
        }

        // 2. Cập nhật thông tin cơ bản của Video
        if (request.getTitle() != null) video.setTitle(request.getTitle());
        if (request.getDescription() != null) video.setDescription(request.getDescription());
        if (request.getCategories() != null || request.getHashtags() != null) {
            processCategoriesAndHashtags(video, request.getCategories(), request.getHashtags());
        }

        // 5. Cập nhật Thumbnail & Xử lý AWS S3
        String thumbnailPresignedUrl = null;
        if (request.getThumbnailFileName() != null && request.getThumbnailContentType() != null) {

            // 5.1. Xóa ảnh cũ trên S3 nếu tồn tại
            if (video.getThumbnail() != null) {
                String oldKey = extractS3KeyFromUrl(video.getThumbnail());
                if (oldKey != null) {
                    try {
                        s3Service.deleteFile(oldKey);
                    } catch (Exception e) {
                        // Log lỗi nhưng không chặn quá trình update nếu xóa file cũ thất bại
                        System.err.println("Failed to delete old thumbnail: " + e.getMessage());
                    }
                }
            }

            // 5.2. Cấu hình thông tin ảnh mới
            String uniqueFileName = java.util.UUID.randomUUID() + "_" + request.getThumbnailFileName();
            String objectKey = "thumbnails/" + uniqueFileName;
            String publicUrl = String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, objectKey);

            video.setThumbnail(publicUrl);

            // 5.3. Tạo Presigned URL để client upload ảnh mới lên S3
            thumbnailPresignedUrl = s3Service.generatePresignedUrl(objectKey, request.getThumbnailContentType());
        }

        // 6. Lưu và trả về kết quả
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

        // 1. Tìm video
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Video không tồn tại với ID: " + videoId));

        // 2. Kiểm tra quyền sở hữu
        Long ownerId = video.getUser().getId();
        Long currentUserId = userPrincipal.getUser().getId();

        if (!ownerId.equals(currentUserId)) {
            throw new AccessDeniedException("Bạn không có quyền xoá video này!");
        }

        // 3. Xoá video
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

            // 2. Nếu subscriber đang online → push qua WebSocket
            if (onlineUserService.isOnline(subscriberId)) {
                messagingTemplate.convertAndSend(
                        "/topic/notification/" + subscriberId,
                        notificationResponse
                );
            }
        }
    }
// Thêm dependency này vào phía trên cùng của VideoService cùng các thuộc tính khác:
// private final ViolationService violationService;

    @Transactional
    public void acceptVideo(Long videoId) {
        // 1. Tìm video theo ID
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video không tồn tại với ID: " + videoId));

        // 2. Kiểm tra nếu trạng thái hiện tại không phải PENDING (Tùy chọn - giúp dữ liệu chặt chẽ hơn)
        if (video.getVideoStatus() != VideoStatus.PENDING) {
            throw new IllegalStateException("Video này đã được xử lý trước đó!");
        }

        // 3. Cập nhật trạng thái thành ACCEPTED
        video.setVideoStatus(VideoStatus.ACCEPTED);

        // 4. Lưu lại vào Database
        videoRepository.save(video);
    }

    @Transactional
    public void rejectVideo(ViolationRequestDto violationRequestDto) {
        // 1. Tìm video dựa trên videoId từ DTO
        Long videoId = violationRequestDto.getVideoId();
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video không tồn tại với ID: " + videoId));

        // 2. Kiểm tra trạng thái hiện tại phải là PENDING
        if (video.getVideoStatus() != VideoStatus.PENDING) {
            throw new IllegalStateException("Video này đã được xử lý trước đó!");
        }

        // 3. Cập nhật trạng thái thành REJECTED và lưu video
        video.setVideoStatus(VideoStatus.REJECTED);
        videoRepository.save(video);

        // 4. Điền bổ sung userId (chủ sở hữu video) vào DTO để ViolationService xử lý phạt gậy chính xác
        violationRequestDto.setUserId(video.getUser().getId());

        // 5. Gọi ViolationService để tạo vi phạm, cộng gậy và gửi thông báo hệ thống
        violationService.createViolation(violationRequestDto);
    }
    public PageResponse<VideoResponseDto> getRelatedVideos(Long videoId, int page) {
        // 1. Tìm video gốc để lấy dữ liệu làm gốc gợi ý
        Video currentVideo = videoRepository.findByIdWithDetails(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video không tồn tại với ID: " + videoId));

        // 2. Trích xuất danh sách tên danh mục và hashtag dưới dạng List<String>
        List<String> categoryNames = currentVideo.getCategories().stream()
                .map(Category::getCategoryName)
                .collect(Collectors.toList());

        List<String> hashtagNames = currentVideo.getHashtags().stream()
                .map(Hashtag::getHashtagName)
                .collect(Collectors.toList());

        // Đảm bảo list không rỗng để tránh lỗi cú pháp SQL IN
        if (categoryNames.isEmpty()) categoryNames.add("");
        if (hashtagNames.isEmpty()) hashtagNames.add("");

        Long authorId = currentVideo.getUser().getId();

        // 3. Lấy toàn bộ video thỏa mãn (Hoặc tác giả, Hoặc Category, Hoặc Hashtag)
        List<Video> rawVideos = videoRepository.findRelatedVideosRaw(
                currentVideo.getId(),
                authorId,
                categoryNames,
                hashtagNames
        );

        // 4. Định nghĩa hàm tính điểm chính xác bằng Java (Có tính thêm trọng số Hashtag nếu bạn muốn)
        java.util.function.ToIntFunction<Video> calculateScore = video -> {
            int score = 0;

            // Cùng tác giả: +2 điểm
            if (video.getUser() != null && video.getUser().getId().equals(authorId)) {
                score += 2;
            }

            // Cùng danh mục: +3 điểm
            boolean hasMatchingCategory = video.getCategories().stream()
                    .anyMatch(c -> categoryNames.contains(c.getCategoryName()));
            if (hasMatchingCategory) {
                score += 3;
            }

            // Cùng hashtag: +1 điểm (Bổ sung thêm để tối ưu thuật toán gợi ý của bạn)
            boolean hasMatchingHashtag = video.getHashtags().stream()
                    .anyMatch(h -> hashtagNames.contains(h.getHashtagName()));
            if (hasMatchingHashtag) {
                score += 1;
            }

            return score;
        };

        // 5. Sắp xếp: Điểm cao đứng trước, bằng điểm thì video mới đứng trước
        List<Video> sortedVideos = rawVideos.stream()
                .sorted(Comparator.comparingInt(calculateScore).reversed()
                        .thenComparing(Video::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());

        // 6. Phân trang thủ công trên bộ nhớ (In-Memory Pagination)
        int pageSize = 10;
        int totalElements = sortedVideos.size();
        int start = Math.min(page * pageSize, totalElements);
        int end = Math.min((page + 1) * pageSize, totalElements);

        List<Video> pagedVideos = sortedVideos.subList(start, end);

        // 7. Map sang DTO và đóng gói kết quả trả về
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

        // Tìm xem user đã từng like video này chưa
        Optional<VideoLike> existingLike = videoLikeRepository.findByUserIdAndVideoId(user.getId(), videoId);

        boolean isLikedNow;

        if (existingLike.isPresent()) {
            // 1. Nếu ĐÃ LIKE RỒI -> Thực hiện UNLIKE
            videoLikeRepository.delete(existingLike.get()); // Xóa dòng lưu trữ trong bảng trung gian
            video.setLikeCount(Math.max(0, video.getLikeCount() - 1)); // Giảm số lượng like tổng (tránh âm)
            isLikedNow = false;
        } else {
            // 2. Nếu CHƯA LIKE -> Thực hiện LIKE
            VideoLike newLike = new VideoLike(user, video);
            videoLikeRepository.save(newLike); // Lưu vào bảng trung gian
            video.setLikeCount(video.getLikeCount() + 1); // Tăng số lượng like tổng
            isLikedNow = true;
        }

        Video updatedVideo = videoRepository.save(video);

        // Map sang DTO và gán trạng thái isLiked hiện tại để FE cập nhật UI
        VideoResponseDto responseDto = videoMapper.toVideoResponseDto(updatedVideo);
        responseDto.setLiked(isLikedNow);

        return responseDto;
    }

    public PageResponse<VideoResponseDto> searchVideos(String keyword, int page) {
        // 1. Cấu hình phân trang: 10 item/trang, sắp xếp giảm dần theo thời gian tạo (mới nhất lên đầu)
        Pageable pageable = PageRequest.of(page, 10, Sort.by("createdAt").descending());

        // 2. Gọi Repository thực hiện tìm kiếm dạng %LIKE% hạ tầng Database
        // Nếu keyword truyền vào bị null hoặc rỗng, có thể handle lấy chuỗi trống "" để không lỗi dữ liệu
        String searchKeyword = (keyword != null) ? keyword.trim() : "";
        Page<Video> videoPage = videoRepository.findByTitleContainingIgnoreCase(searchKeyword, pageable);

        // 3. Chuyển đổi dữ liệu Entity Page sang DTO Page thông qua Map Struct / VideoMapper
        Page<VideoResponseDto> dtoPage = videoPage.map(videoMapper::toVideoResponseDto);

        // 4. Đóng gói kết quả trả về cấu trúc PageResponse quy định
        return new PageResponse<>(dtoPage);
    }
}