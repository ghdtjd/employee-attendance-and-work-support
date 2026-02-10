package com.teamproject.workhub;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication  // exclude 전부 제거
public class WorkhubApplication {

    public static void main(String[] args) {
        SpringApplication.run(WorkhubApplication.class, args);
    }

}