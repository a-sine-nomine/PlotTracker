package com.sinenomine.plottracker.dto;

import jakarta.validation.constraints.NotBlank;

public class ChangePasswordRequestDto {

    @NotBlank(message = "errors.currentPassword.required")
    private String currentPassword;

    @NotBlank(message = "errors.newPassword.required")
    private String newPassword;

    public String getCurrentPassword() {
        return currentPassword;
    }
    public void setCurrentPassword(String currentPassword) {
        this.currentPassword = currentPassword;
    }
    public String getNewPassword() {
        return newPassword;
    }
    public void setNewPassword(String newPassword) {
        this.newPassword = newPassword;
    }
}
