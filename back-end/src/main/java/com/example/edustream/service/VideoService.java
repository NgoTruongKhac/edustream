package com.example.edustream.service;

import com.example.edustream.dto.request.VideoYoutubeRequestDto;
import com.example.edustream.dto.response.PageResponse;
import com.example.edustream.dto.response.VideoResponseDto;
import com.example.edustream.entity.Category;
import com.example.edustream.entity.Hashtag;
import com.example.edustream.entity.User;
import com.example.edustream.entity.UserPrincipal;
import com.example.edustream.entity.Video;
import com.example.edustream.exception.ResourceNotFoundException;
import com.example.edustream.mapper.VideoMapper;
import com.example.edustream.repository.CategoryRepository;
import com.example.edustream.repository.HashtagRepository;
import com.example.edustream.repository.VideoRepository;
import com.example.edustream.util.StringUtil;
import lombok.RequiredArgsConstructor;
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
    private final VideoMapper videoMapper; // Inject mapper

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