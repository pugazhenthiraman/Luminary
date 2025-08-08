import axiosInstance from './axiosInstance';

export const getCourses = (params = {}) => axiosInstance.get('/courses', { params });
export const getCourseById = (courseId) => axiosInstance.get(`/courses/${courseId}`);


