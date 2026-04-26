package com.example.edustream.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

public class StringUtil {

    /**
     * Chuyển đổi Username thành Base Handle (vd: "David Nguyen" -> "davidnguyen")
     */
    public static String toBaseHandle(String input) {
        if (input == null) return "";

        // 1. Loại bỏ dấu tiếng Việt
        String temp = Normalizer.normalize(input, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String out = pattern.matcher(temp).replaceAll("").replace('đ', 'd').replace('Đ', 'D');

        // 2. Chuyển thành chữ thường, xóa khoảng trắng và ký tự đặc biệt
        return out.toLowerCase()
                .replaceAll("[^a-z0-0]", "") // Chỉ giữ lại chữ cái và số
                .trim();
    }

    public static String generateSlug(String input) {
        if (input == null || input.isEmpty()) {
            return "";
        }

        String temp = input.replace("đ", "d").replace("Đ", "D");
        String normalized = Normalizer.normalize(temp, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(normalized).replaceAll("");

        return slug.toLowerCase()
                .trim()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-");
    }

}