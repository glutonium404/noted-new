package com.noted.dto;

public class NoteSummaryResponse {
    private String summary;

    public NoteSummaryResponse() {
    }

    public NoteSummaryResponse(String summary) {
        this.summary = summary;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }
}
