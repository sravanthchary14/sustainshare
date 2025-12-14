package com.sustainshare.backend.controller.dto;

public class ClaimRequest {
    private Long charityId;

    public ClaimRequest() {}

    public ClaimRequest(Long charityId) {
        this.charityId = charityId;
    }

    public Long getCharityId() {
        return charityId;
    }

    public void setCharityId(Long charityId) {
        this.charityId = charityId;
    }
}
