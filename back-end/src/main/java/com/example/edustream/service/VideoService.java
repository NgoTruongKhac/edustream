package com.example.edustream.service;

import com.example.edustream.dto.request.VideoUploadRequestDto;
import com.example.edustream.dto.request.VideoYoutubeRequestDto;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.dto.response.VideoResponseDto;
import com.example.edustream.dto.response.VideoUploadResponseDto;
import com.example.edustream.entity.Category;
import com.example.edustream.entity.Hashtag;
import com.example.edustream.entity.User;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.entity.Video;
import com.example.edustream.entity.enums.VideoStatus;
import com.example.edustream.entity.enums.VideoType;
import com.example.edustream.exception.ResourceNotFoundException;
import com.example.edustream.mapper.VideoMapper;
import com.example.edustream.repository.CategoryRepository;
import com.example.edustream.repository.HashtagRepository;
import com.example.edustream.repository.VideoRepository;
import com.example.edustream.util.StringUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VideoService {

    private final VideoRepository videoRepository;
    private final CategoryRepository categoryRepository;
    private final HashtagRepository hashtagRepository;
    private final VideoMapper videoMapper;

    private final S3Service s3Service;

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

        Video savedVideo = videoRepository.save(video);

        if (request.getHashtags() != null && !request.getHashtags().isEmpty()) {
            List<Hashtag> hashtags = request.getHashtags().stream().map(name -> {
                Hashtag hashtag = new Hashtag();
                hashtag.setHashtagName(name);
                hashtag.setVideo(savedVideo);
                return hashtag;
            }).collect(Collectors.toList());
            hashtagRepository.saveAll(hashtags);
        }

        // 3. Tạo và lưu danh sách Categories với Slug
        if (request.getCategories() != null && !request.getCategories().isEmpty()) {
            List<Category> categories = request.getCategories().stream().map(name -> {
                Category category = new Category();
                category.setCategoryName(name);
                category.setSlugName(StringUtil.generateSlug(name));
                category.setVideo(savedVideo);
                return category;
            }).collect(Collectors.toList());
            categoryRepository.saveAll(categories);
        }

// 3. Gọi S3Service để lấy Presigned URL cho VIDEO
        String presignedUrl = s3Service.generatePresignedUrl(objectKey, request.getContentType());

        // 4. Trả về thông tin
        VideoResponseDto videoInfo = videoMapper.toVideoResponseDto(savedVideo);
        return new VideoUploadResponseDto(videoInfo, presignedUrl, thumbnailPresignedUrl);
    }

    @Transactional
    public VideoResponseDto createVideoYoutube(VideoYoutubeRequestDto request, UserPrincipal userPrincipal) {
        User user = userPrincipal.getUser();

        // 1. Sử dụng Mapper để chuyển DTO sang Entity
        Video video = videoMapper.toVideo(request);
        video.setUser(user); // Set User lấy từ Security Context

        Video savedVideo = videoRepository.save(video);

        // 2. Tạo và lưu danh sách Hashtags
        if (request.getHashtags() != null && !request.getHashtags().isEmpty()) {
            List<Hashtag> hashtags = request.getHashtags().stream().map(name -> {
                Hashtag hashtag = new Hashtag();
                hashtag.setHashtagName(name);
                hashtag.setVideo(savedVideo);
                return hashtag;
            }).collect(Collectors.toList());
            hashtagRepository.saveAll(hashtags);
        }

        // 3. Tạo và lưu danh sách Categories với Slug
        if (request.getCategories() != null && !request.getCategories().isEmpty()) {
            List<Category> categories = request.getCategories().stream().map(name -> {
                Category category = new Category();
                category.setCategoryName(name);
                category.setSlugName(StringUtil.generateSlug(name));
                category.setVideo(savedVideo);
                return category;
            }).collect(Collectors.toList());
            categoryRepository.saveAll(categories);
        }

        // 4. Sử dụng Mapper để trả về Response Dto (tự động lấy fullName và avatar từ User)
        return videoMapper.toVideoResponseDto(savedVideo);
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

        if (video.getVideoStatus() == VideoStatus.PUBLISHED) {
            // Nếu đã PUBLISHED rồi thì không cần làm gì thêm, trả về luôn
            return videoMapper.toVideoResponseDto(video);
        }

        // 4. Cập nhật trạng thái
        video.setVideoStatus(VideoStatus.PUBLISHED);
        Video updatedVideo = videoRepository.save(video);

        // 5. Trả về thông tin video đã được cập nhật
        return videoMapper.toVideoResponseDto(updatedVideo);
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

    public VideoResponseDto getVideoById(long videoId) {
        Video video = videoRepository.findById(videoId)
                .orElseThrow(() -> new ResourceNotFoundException("Video không tồn tại với ID: " + videoId));

        return videoMapper.toVideoResponseDto(video);
    }


}