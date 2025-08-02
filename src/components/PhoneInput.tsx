import React, { useState, useEffect } from 'react';
import { FaPhone, FaChevronDown, FaGlobe, FaSearch } from 'react-icons/fa';

interface Country {
  code: string;
  name: string;
  dialCode: string;
  flag: string;
  minLength: number;
  maxLength: number;
}

interface PhoneInputProps {
  value: string;
  onChange: (value: string, country: Country) => void;
  onValidationChange?: (isValid: boolean, errorMessage: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  error?: string;
}

// Comprehensive list of countries with their dial codes and phone number rules
const countries: Country[] = [
  // Most Common Countries (Top)
  { code: 'in', name: 'India', dialCode: '+91', flag: '🇮🇳', minLength: 10, maxLength: 10 },
  { code: 'us', name: 'United States', dialCode: '+1', flag: '🇺🇸', minLength: 10, maxLength: 10 },
  { code: 'gb', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧', minLength: 10, maxLength: 11 },
  { code: 'ca', name: 'Canada', dialCode: '+1', flag: '🇨🇦', minLength: 10, maxLength: 10 },
  { code: 'au', name: 'Australia', dialCode: '+61', flag: '🇦🇺', minLength: 9, maxLength: 9 },
  { code: 'nz', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿', minLength: 9, maxLength: 9 },
  
  // Europe
  { code: 'de', name: 'Germany', dialCode: '+49', flag: '🇩🇪', minLength: 10, maxLength: 12 },
  { code: 'fr', name: 'France', dialCode: '+33', flag: '🇫🇷', minLength: 9, maxLength: 9 },
  { code: 'it', name: 'Italy', dialCode: '+39', flag: '🇮🇹', minLength: 9, maxLength: 10 },
  { code: 'es', name: 'Spain', dialCode: '+34', flag: '🇪🇸', minLength: 9, maxLength: 9 },
  { code: 'nl', name: 'Netherlands', dialCode: '+31', flag: '🇳🇱', minLength: 9, maxLength: 9 },
  { code: 'se', name: 'Sweden', dialCode: '+46', flag: '🇸🇪', minLength: 9, maxLength: 9 },
  { code: 'no', name: 'Norway', dialCode: '+47', flag: '🇳🇴', minLength: 8, maxLength: 8 },
  { code: 'dk', name: 'Denmark', dialCode: '+45', flag: '🇩🇰', minLength: 8, maxLength: 8 },
  { code: 'fi', name: 'Finland', dialCode: '+358', flag: '🇫🇮', minLength: 9, maxLength: 9 },
  { code: 'ch', name: 'Switzerland', dialCode: '+41', flag: '🇨🇭', minLength: 9, maxLength: 9 },
  { code: 'at', name: 'Austria', dialCode: '+43', flag: '🇦🇹', minLength: 10, maxLength: 13 },
  { code: 'be', name: 'Belgium', dialCode: '+32', flag: '🇧🇪', minLength: 9, maxLength: 9 },
  { code: 'pl', name: 'Poland', dialCode: '+48', flag: '🇵🇱', minLength: 9, maxLength: 9 },
  { code: 'cz', name: 'Czech Republic', dialCode: '+420', flag: '🇨🇿', minLength: 9, maxLength: 9 },
  { code: 'hu', name: 'Hungary', dialCode: '+36', flag: '🇭🇺', minLength: 9, maxLength: 9 },
  { code: 'ro', name: 'Romania', dialCode: '+40', flag: '🇷🇴', minLength: 9, maxLength: 9 },
  { code: 'bg', name: 'Bulgaria', dialCode: '+359', flag: '🇧🇬', minLength: 9, maxLength: 9 },
  { code: 'hr', name: 'Croatia', dialCode: '+385', flag: '🇭🇷', minLength: 8, maxLength: 9 },
  { code: 'si', name: 'Slovenia', dialCode: '+386', flag: '🇸🇮', minLength: 8, maxLength: 8 },
  { code: 'sk', name: 'Slovakia', dialCode: '+421', flag: '🇸🇰', minLength: 9, maxLength: 9 },
  { code: 'lt', name: 'Lithuania', dialCode: '+370', flag: '🇱🇹', minLength: 8, maxLength: 8 },
  { code: 'lv', name: 'Latvia', dialCode: '+371', flag: '🇱🇻', minLength: 8, maxLength: 8 },
  { code: 'ee', name: 'Estonia', dialCode: '+372', flag: '🇪🇪', minLength: 7, maxLength: 8 },
  { code: 'ie', name: 'Ireland', dialCode: '+353', flag: '🇮🇪', minLength: 9, maxLength: 9 },
  { code: 'pt', name: 'Portugal', dialCode: '+351', flag: '🇵🇹', minLength: 9, maxLength: 9 },
  { code: 'gr', name: 'Greece', dialCode: '+30', flag: '🇬🇷', minLength: 10, maxLength: 10 },
  { code: 'cy', name: 'Cyprus', dialCode: '+357', flag: '🇨🇾', minLength: 8, maxLength: 8 },
  { code: 'mt', name: 'Malta', dialCode: '+356', flag: '🇲🇹', minLength: 8, maxLength: 8 },
  { code: 'is', name: 'Iceland', dialCode: '+354', flag: '🇮🇸', minLength: 7, maxLength: 7 },
  { code: 'lu', name: 'Luxembourg', dialCode: '+352', flag: '🇱🇺', minLength: 9, maxLength: 9 },
  
  // Asia
  { code: 'cn', name: 'China', dialCode: '+86', flag: '🇨🇳', minLength: 11, maxLength: 11 },
  { code: 'jp', name: 'Japan', dialCode: '+81', flag: '🇯🇵', minLength: 10, maxLength: 11 },
  { code: 'kr', name: 'South Korea', dialCode: '+82', flag: '🇰🇷', minLength: 10, maxLength: 11 },
  { code: 'sg', name: 'Singapore', dialCode: '+65', flag: '🇸🇬', minLength: 8, maxLength: 8 },
  { code: 'my', name: 'Malaysia', dialCode: '+60', flag: '🇲🇾', minLength: 9, maxLength: 10 },
  { code: 'th', name: 'Thailand', dialCode: '+66', flag: '🇹🇭', minLength: 9, maxLength: 9 },
  { code: 'vn', name: 'Vietnam', dialCode: '+84', flag: '🇻🇳', minLength: 9, maxLength: 10 },
  { code: 'ph', name: 'Philippines', dialCode: '+63', flag: '🇵🇭', minLength: 10, maxLength: 10 },
  { code: 'id', name: 'Indonesia', dialCode: '+62', flag: '🇮🇩', minLength: 9, maxLength: 12 },
  { code: 'bd', name: 'Bangladesh', dialCode: '+880', flag: '🇧🇩', minLength: 10, maxLength: 11 },
  { code: 'pk', name: 'Pakistan', dialCode: '+92', flag: '🇵🇰', minLength: 10, maxLength: 10 },
  { code: 'lk', name: 'Sri Lanka', dialCode: '+94', flag: '🇱🇰', minLength: 9, maxLength: 9 },
  { code: 'np', name: 'Nepal', dialCode: '+977', flag: '🇳🇵', minLength: 10, maxLength: 10 },
  { code: 'mm', name: 'Myanmar', dialCode: '+95', flag: '🇲🇲', minLength: 9, maxLength: 10 },
  { code: 'kh', name: 'Cambodia', dialCode: '+855', flag: '🇰🇭', minLength: 8, maxLength: 9 },
  { code: 'la', name: 'Laos', dialCode: '+856', flag: '🇱🇦', minLength: 10, maxLength: 10 },
  { code: 'mn', name: 'Mongolia', dialCode: '+976', flag: '🇲🇳', minLength: 8, maxLength: 8 },
  { code: 'kz', name: 'Kazakhstan', dialCode: '+7', flag: '🇰🇿', minLength: 10, maxLength: 10 },
  { code: 'uz', name: 'Uzbekistan', dialCode: '+998', flag: '🇺🇿', minLength: 9, maxLength: 9 },
  { code: 'kg', name: 'Kyrgyzstan', dialCode: '+996', flag: '🇰🇬', minLength: 9, maxLength: 9 },
  { code: 'tj', name: 'Tajikistan', dialCode: '+992', flag: '🇹🇯', minLength: 9, maxLength: 9 },
  { code: 'tm', name: 'Turkmenistan', dialCode: '+993', flag: '🇹🇲', minLength: 8, maxLength: 8 },
  { code: 'af', name: 'Afghanistan', dialCode: '+93', flag: '🇦🇫', minLength: 9, maxLength: 9 },
  { code: 'ir', name: 'Iran', dialCode: '+98', flag: '🇮🇷', minLength: 10, maxLength: 10 },
  { code: 'iq', name: 'Iraq', dialCode: '+964', flag: '🇮🇶', minLength: 10, maxLength: 10 },
  { code: 'sa', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦', minLength: 9, maxLength: 9 },
  { code: 'ae', name: 'UAE', dialCode: '+971', flag: '🇦🇪', minLength: 9, maxLength: 9 },
  { code: 'qa', name: 'Qatar', dialCode: '+974', flag: '🇶🇦', minLength: 8, maxLength: 8 },
  { code: 'kw', name: 'Kuwait', dialCode: '+965', flag: '🇰🇼', minLength: 8, maxLength: 8 },
  { code: 'bh', name: 'Bahrain', dialCode: '+973', flag: '🇧🇭', minLength: 8, maxLength: 8 },
  { code: 'om', name: 'Oman', dialCode: '+968', flag: '🇴🇲', minLength: 8, maxLength: 8 },
  { code: 'ye', name: 'Yemen', dialCode: '+967', flag: '🇾🇪', minLength: 9, maxLength: 9 },
  { code: 'jo', name: 'Jordan', dialCode: '+962', flag: '🇯🇴', minLength: 9, maxLength: 9 },
  { code: 'lb', name: 'Lebanon', dialCode: '+961', flag: '🇱🇧', minLength: 8, maxLength: 8 },
  { code: 'sy', name: 'Syria', dialCode: '+963', flag: '🇸🇾', minLength: 9, maxLength: 9 },
  { code: 'il', name: 'Israel', dialCode: '+972', flag: '🇮🇱', minLength: 9, maxLength: 9 },
  { code: 'ps', name: 'Palestine', dialCode: '+970', flag: '🇵🇸', minLength: 9, maxLength: 9 },
  { code: 'tr', name: 'Turkey', dialCode: '+90', flag: '🇹🇷', minLength: 10, maxLength: 10 },
  { code: 'ge', name: 'Georgia', dialCode: '+995', flag: '🇬🇪', minLength: 9, maxLength: 9 },
  { code: 'am', name: 'Armenia', dialCode: '+374', flag: '🇦🇲', minLength: 8, maxLength: 8 },
  { code: 'az', name: 'Azerbaijan', dialCode: '+994', flag: '🇦🇿', minLength: 9, maxLength: 9 },
  
  // Africa
  { code: 'za', name: 'South Africa', dialCode: '+27', flag: '🇿🇦', minLength: 9, maxLength: 9 },
  { code: 'eg', name: 'Egypt', dialCode: '+20', flag: '🇪🇬', minLength: 10, maxLength: 10 },
  { code: 'ng', name: 'Nigeria', dialCode: '+234', flag: '🇳🇬', minLength: 10, maxLength: 11 },
  { code: 'ke', name: 'Kenya', dialCode: '+254', flag: '🇰🇪', minLength: 9, maxLength: 9 },
  { code: 'gh', name: 'Ghana', dialCode: '+233', flag: '🇬🇭', minLength: 9, maxLength: 9 },
  { code: 'et', name: 'Ethiopia', dialCode: '+251', flag: '🇪🇹', minLength: 9, maxLength: 9 },
  { code: 'tz', name: 'Tanzania', dialCode: '+255', flag: '🇹🇿', minLength: 9, maxLength: 9 },
  { code: 'ug', name: 'Uganda', dialCode: '+256', flag: '🇺🇬', minLength: 9, maxLength: 9 },
  { code: 'zm', name: 'Zambia', dialCode: '+260', flag: '🇿🇲', minLength: 9, maxLength: 9 },
  { code: 'zw', name: 'Zimbabwe', dialCode: '+263', flag: '🇿🇼', minLength: 9, maxLength: 9 },
  { code: 'mw', name: 'Malawi', dialCode: '+265', flag: '🇲🇼', minLength: 9, maxLength: 9 },
  { code: 'bw', name: 'Botswana', dialCode: '+267', flag: '🇧🇼', minLength: 8, maxLength: 8 },
  { code: 'na', name: 'Namibia', dialCode: '+264', flag: '🇳🇦', minLength: 9, maxLength: 9 },
  { code: 'sz', name: 'Eswatini', dialCode: '+268', flag: '🇸🇿', minLength: 8, maxLength: 8 },
  { code: 'ls', name: 'Lesotho', dialCode: '+266', flag: '🇱🇸', minLength: 8, maxLength: 8 },
  { code: 'mz', name: 'Mozambique', dialCode: '+258', flag: '🇲🇿', minLength: 9, maxLength: 9 },
  { code: 'ao', name: 'Angola', dialCode: '+244', flag: '🇦🇴', minLength: 9, maxLength: 9 },
  { code: 'cm', name: 'Cameroon', dialCode: '+237', flag: '🇨🇲', minLength: 9, maxLength: 9 },
  { code: 'ci', name: 'Ivory Coast', dialCode: '+225', flag: '🇨🇮', minLength: 10, maxLength: 10 },
  { code: 'sn', name: 'Senegal', dialCode: '+221', flag: '🇸🇳', minLength: 9, maxLength: 9 },
  { code: 'ml', name: 'Mali', dialCode: '+223', flag: '🇲🇱', minLength: 8, maxLength: 8 },
  { code: 'bf', name: 'Burkina Faso', dialCode: '+226', flag: '🇧🇫', minLength: 8, maxLength: 8 },
  { code: 'ne', name: 'Niger', dialCode: '+227', flag: '🇳🇪', minLength: 8, maxLength: 8 },
  { code: 'td', name: 'Chad', dialCode: '+235', flag: '🇹🇩', minLength: 8, maxLength: 8 },
  { code: 'sd', name: 'Sudan', dialCode: '+249', flag: '🇸🇩', minLength: 9, maxLength: 9 },
  { code: 'ss', name: 'South Sudan', dialCode: '+211', flag: '🇸🇸', minLength: 9, maxLength: 9 },
  { code: 'er', name: 'Eritrea', dialCode: '+291', flag: '🇪🇷', minLength: 7, maxLength: 7 },
  { code: 'dj', name: 'Djibouti', dialCode: '+253', flag: '🇩🇯', minLength: 8, maxLength: 8 },
  { code: 'so', name: 'Somalia', dialCode: '+252', flag: '🇸🇴', minLength: 8, maxLength: 8 },
  { code: 'mg', name: 'Madagascar', dialCode: '+261', flag: '🇲🇬', minLength: 9, maxLength: 9 },
  { code: 'mu', name: 'Mauritius', dialCode: '+230', flag: '🇲🇺', minLength: 8, maxLength: 8 },
  { code: 'sc', name: 'Seychelles', dialCode: '+248', flag: '🇸🇨', minLength: 7, maxLength: 7 },
  { code: 'km', name: 'Comoros', dialCode: '+269', flag: '🇰🇲', minLength: 7, maxLength: 7 },
  { code: 'mr', name: 'Mauritania', dialCode: '+222', flag: '🇲🇷', minLength: 8, maxLength: 8 },
  { code: 'gm', name: 'Gambia', dialCode: '+220', flag: '🇬🇲', minLength: 7, maxLength: 7 },
  { code: 'gw', name: 'Guinea-Bissau', dialCode: '+245', flag: '🇬🇼', minLength: 7, maxLength: 7 },
  { code: 'gn', name: 'Guinea', dialCode: '+224', flag: '🇬🇳', minLength: 9, maxLength: 9 },
  { code: 'sl', name: 'Sierra Leone', dialCode: '+232', flag: '🇸🇱', minLength: 8, maxLength: 8 },
  { code: 'lr', name: 'Liberia', dialCode: '+231', flag: '🇱🇷', minLength: 8, maxLength: 8 },
  { code: 'tg', name: 'Togo', dialCode: '+228', flag: '🇹🇬', minLength: 8, maxLength: 8 },
  { code: 'bj', name: 'Benin', dialCode: '+229', flag: '🇧🇯', minLength: 8, maxLength: 8 },
  { code: 'ga', name: 'Gabon', dialCode: '+241', flag: '🇬🇦', minLength: 8, maxLength: 8 },
  { code: 'cg', name: 'Congo', dialCode: '+242', flag: '🇨🇬', minLength: 9, maxLength: 9 },
  { code: 'cd', name: 'DR Congo', dialCode: '+243', flag: '🇨🇩', minLength: 9, maxLength: 9 },
  { code: 'cf', name: 'Central African Republic', dialCode: '+236', flag: '🇨🇫', minLength: 8, maxLength: 8 },
  { code: 'gq', name: 'Equatorial Guinea', dialCode: '+240', flag: '🇬🇶', minLength: 9, maxLength: 9 },
  { code: 'st', name: 'São Tomé and Príncipe', dialCode: '+239', flag: '🇸🇹', minLength: 7, maxLength: 7 },
  { code: 'rw', name: 'Rwanda', dialCode: '+250', flag: '🇷🇼', minLength: 9, maxLength: 9 },
  { code: 'bi', name: 'Burundi', dialCode: '+257', flag: '🇧🇮', minLength: 8, maxLength: 8 },
  { code: 'ly', name: 'Libya', dialCode: '+218', flag: '🇱🇾', minLength: 9, maxLength: 9 },
  { code: 'tn', name: 'Tunisia', dialCode: '+216', flag: '🇹🇳', minLength: 8, maxLength: 8 },
  { code: 'dz', name: 'Algeria', dialCode: '+213', flag: '🇩🇿', minLength: 9, maxLength: 9 },
  { code: 'ma', name: 'Morocco', dialCode: '+212', flag: '🇲🇦', minLength: 9, maxLength: 9 },
  { code: 'eh', name: 'Western Sahara', dialCode: '+212', flag: '🇪🇭', minLength: 9, maxLength: 9 },
  { code: 'cv', name: 'Cape Verde', dialCode: '+238', flag: '🇨🇻', minLength: 7, maxLength: 7 },
  
  // Americas
  { code: 'mx', name: 'Mexico', dialCode: '+52', flag: '🇲🇽', minLength: 10, maxLength: 10 },
  { code: 'br', name: 'Brazil', dialCode: '+55', flag: '🇧🇷', minLength: 10, maxLength: 11 },
  { code: 'ar', name: 'Argentina', dialCode: '+54', flag: '🇦🇷', minLength: 10, maxLength: 10 },
  { code: 'cl', name: 'Chile', dialCode: '+56', flag: '🇨🇱', minLength: 9, maxLength: 9 },
  { code: 'co', name: 'Colombia', dialCode: '+57', flag: '🇨🇴', minLength: 10, maxLength: 10 },
  { code: 'pe', name: 'Peru', dialCode: '+51', flag: '🇵🇪', minLength: 9, maxLength: 9 },
  { code: 've', name: 'Venezuela', dialCode: '+58', flag: '🇻🇪', minLength: 10, maxLength: 10 },
  { code: 'ec', name: 'Ecuador', dialCode: '+593', flag: '🇪🇨', minLength: 9, maxLength: 9 },
  { code: 'bo', name: 'Bolivia', dialCode: '+591', flag: '🇧🇴', minLength: 8, maxLength: 8 },
  { code: 'py', name: 'Paraguay', dialCode: '+595', flag: '🇵🇾', minLength: 9, maxLength: 9 },
  { code: 'uy', name: 'Uruguay', dialCode: '+598', flag: '🇺🇾', minLength: 8, maxLength: 8 },
  { code: 'gy', name: 'Guyana', dialCode: '+592', flag: '🇬🇾', minLength: 7, maxLength: 7 },
  { code: 'sr', name: 'Suriname', dialCode: '+597', flag: '🇸🇷', minLength: 7, maxLength: 7 },
  { code: 'gf', name: 'French Guiana', dialCode: '+594', flag: '🇬🇫', minLength: 9, maxLength: 9 },
  { code: 'fk', name: 'Falkland Islands', dialCode: '+500', flag: '🇫🇰', minLength: 5, maxLength: 5 },
  { code: 'gt', name: 'Guatemala', dialCode: '+502', flag: '🇬🇹', minLength: 8, maxLength: 8 },
  { code: 'bz', name: 'Belize', dialCode: '+501', flag: '🇧🇿', minLength: 7, maxLength: 7 },
  { code: 'sv', name: 'El Salvador', dialCode: '+503', flag: '🇸🇻', minLength: 8, maxLength: 8 },
  { code: 'hn', name: 'Honduras', dialCode: '+504', flag: '🇭🇳', minLength: 8, maxLength: 8 },
  { code: 'ni', name: 'Nicaragua', dialCode: '+505', flag: '🇳🇮', minLength: 8, maxLength: 8 },
  { code: 'cr', name: 'Costa Rica', dialCode: '+506', flag: '🇨🇷', minLength: 8, maxLength: 8 },
  { code: 'pa', name: 'Panama', dialCode: '+507', flag: '🇵🇦', minLength: 8, maxLength: 8 },
  { code: 'cu', name: 'Cuba', dialCode: '+53', flag: '🇨🇺', minLength: 8, maxLength: 8 },
  { code: 'jm', name: 'Jamaica', dialCode: '+1876', flag: '🇯🇲', minLength: 7, maxLength: 7 },
  { code: 'ht', name: 'Haiti', dialCode: '+509', flag: '🇭🇹', minLength: 8, maxLength: 8 },
  { code: 'do', name: 'Dominican Republic', dialCode: '+1809', flag: '🇩🇴', minLength: 7, maxLength: 7 },
  { code: 'pr', name: 'Puerto Rico', dialCode: '+1787', flag: '🇵🇷', minLength: 7, maxLength: 7 },
  { code: 'tt', name: 'Trinidad and Tobago', dialCode: '+1868', flag: '🇹🇹', minLength: 7, maxLength: 7 },
  { code: 'bb', name: 'Barbados', dialCode: '+1246', flag: '🇧🇧', minLength: 7, maxLength: 7 },
  { code: 'gd', name: 'Grenada', dialCode: '+1473', flag: '🇬🇩', minLength: 7, maxLength: 7 },
  { code: 'lc', name: 'Saint Lucia', dialCode: '+1758', flag: '🇱🇨', minLength: 7, maxLength: 7 },
  { code: 'vc', name: 'Saint Vincent and the Grenadines', dialCode: '+1784', flag: '🇻🇨', minLength: 7, maxLength: 7 },
  { code: 'ag', name: 'Antigua and Barbuda', dialCode: '+1268', flag: '🇦🇬', minLength: 7, maxLength: 7 },
  { code: 'kn', name: 'Saint Kitts and Nevis', dialCode: '+1869', flag: '🇰🇳', minLength: 7, maxLength: 7 },
  { code: 'dm', name: 'Dominica', dialCode: '+1767', flag: '🇩🇲', minLength: 7, maxLength: 7 },
  { code: 'bs', name: 'Bahamas', dialCode: '+1242', flag: '🇧🇸', minLength: 7, maxLength: 7 },
  { code: 'bz', name: 'Belize', dialCode: '+501', flag: '🇧🇿', minLength: 7, maxLength: 7 },
  
  // Oceania
  { code: 'fj', name: 'Fiji', dialCode: '+679', flag: '🇫🇯', minLength: 7, maxLength: 7 },
  { code: 'pg', name: 'Papua New Guinea', dialCode: '+675', flag: '🇵🇬', minLength: 8, maxLength: 8 },
  { code: 'sb', name: 'Solomon Islands', dialCode: '+677', flag: '🇸🇧', minLength: 7, maxLength: 7 },
  { code: 'vu', name: 'Vanuatu', dialCode: '+678', flag: '🇻🇺', minLength: 7, maxLength: 7 },
  { code: 'nc', name: 'New Caledonia', dialCode: '+687', flag: '🇳🇨', minLength: 6, maxLength: 6 },
  { code: 'pf', name: 'French Polynesia', dialCode: '+689', flag: '🇵🇫', minLength: 8, maxLength: 8 },
  { code: 'ws', name: 'Samoa', dialCode: '+685', flag: '🇼🇸', minLength: 7, maxLength: 7 },
  { code: 'to', name: 'Tonga', dialCode: '+676', flag: '🇹🇴', minLength: 7, maxLength: 7 },
  { code: 'ki', name: 'Kiribati', dialCode: '+686', flag: '🇰🇮', minLength: 8, maxLength: 8 },
  { code: 'tv', name: 'Tuvalu', dialCode: '+688', flag: '🇹🇻', minLength: 7, maxLength: 7 },
  { code: 'nr', name: 'Nauru', dialCode: '+674', flag: '🇳🇷', minLength: 7, maxLength: 7 },
  { code: 'pw', name: 'Palau', dialCode: '+680', flag: '🇵🇼', minLength: 7, maxLength: 7 },
  { code: 'fm', name: 'Micronesia', dialCode: '+691', flag: '🇫🇲', minLength: 7, maxLength: 7 },
  { code: 'mh', name: 'Marshall Islands', dialCode: '+692', flag: '🇲🇭', minLength: 7, maxLength: 7 },
  { code: 'ck', name: 'Cook Islands', dialCode: '+682', flag: '🇨🇰', minLength: 5, maxLength: 5 },
  { code: 'nu', name: 'Niue', dialCode: '+683', flag: '🇳🇺', minLength: 4, maxLength: 4 },
  { code: 'tk', name: 'Tokelau', dialCode: '+690', flag: '🇹🇰', minLength: 4, maxLength: 4 },
  { code: 'as', name: 'American Samoa', dialCode: '+1684', flag: '🇦🇸', minLength: 7, maxLength: 7 },
  { code: 'gu', name: 'Guam', dialCode: '+1671', flag: '🇬🇺', minLength: 7, maxLength: 7 },
  { code: 'mp', name: 'Northern Mariana Islands', dialCode: '+1670', flag: '🇲🇵', minLength: 7, maxLength: 7 },
  { code: 'pw', name: 'Palau', dialCode: '+680', flag: '🇵🇼', minLength: 7, maxLength: 7 },
];

const CustomPhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  onValidationChange,
  placeholder = "Enter phone number",
  label,
  required = false,
  disabled = false,
  className = "",
  error
}) => {
  const [isValid, setIsValid] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState<boolean>(false);
  const [selectedCountry, setSelectedCountry] = useState<Country>(countries[1]); // Default to United States
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [phoneNumber, setPhoneNumber] = useState<string>("");

  // Filter countries based on search
  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.dialCode.includes(searchTerm) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get phone number without country code
  const getPhoneNumberWithoutCode = (fullValue: string) => {
    return fullValue.replace(selectedCountry.dialCode, '').trim();
  };

  // Validate phone number based on country rules
  const validatePhone = (phoneValue: string) => {
    if (!phoneValue) {
      const message = required ? "Phone number is required" : "";
      setIsValid(!required);
      setErrorMessage(message);
      onValidationChange?.(!required, message);
      return;
    }

    // Remove country code for validation
    const numberWithoutCode = getPhoneNumberWithoutCode(phoneValue);
    
    // Check if it contains only digits and some special characters
    if (!/^[\d\s\-\(\)\+]+$/.test(phoneValue)) {
      setIsValid(false);
      const message = "Phone number contains invalid characters";
      setErrorMessage(message);
      onValidationChange?.(false, message);
      return;
    }

    // Country-specific validation
    const digitsOnly = numberWithoutCode.replace(/\D/g, '');
    
    if (digitsOnly.length < selectedCountry.minLength) {
      setIsValid(false);
      const message = `${selectedCountry.name} phone numbers must be at least ${selectedCountry.minLength} digits`;
      setErrorMessage(message);
      onValidationChange?.(false, message);
      return;
    }

    if (digitsOnly.length > selectedCountry.maxLength) {
      setIsValid(false);
      const message = `${selectedCountry.name} phone numbers cannot exceed ${selectedCountry.maxLength} digits`;
      setErrorMessage(message);
      onValidationChange?.(false, message);
      return;
    }

    setIsValid(true);
    setErrorMessage("");
    onValidationChange?.(true, "");
  };

  // Handle country selection
  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setShowDropdown(false);
    setSearchTerm("");
    
    // Keep only the phone number part (without old country code)
    const currentPhoneNumber = getPhoneNumberWithoutCode(value);
    const newValue = `${country.dialCode} ${currentPhoneNumber}`.trim();
    
    // Update the phone number display (without country code)
    setPhoneNumber(currentPhoneNumber);
    
    onChange(newValue, country);
    
    // Re-validate with new country rules
    if (currentPhoneNumber) {
      validatePhone(newValue);
    } else {
      // Clear any existing error when switching countries with empty input
      setIsValid(true);
      setErrorMessage("");
      onValidationChange?.(true, "");
    }
  };

  // Handle phone input change
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    setPhoneNumber(inputValue);
    
    // Combine country code with phone number
    const fullValue = `${selectedCountry.dialCode} ${inputValue}`.trim();
    onChange(fullValue, selectedCountry);
    validatePhone(fullValue);
  };

  // Initialize phone number on mount
  useEffect(() => {
    if (value) {
      const numberWithoutCode = getPhoneNumberWithoutCode(value);
      setPhoneNumber(numberWithoutCode);
      validatePhone(value);
    }
  }, []);

  // Re-validate when selectedCountry changes
  useEffect(() => {
    if (phoneNumber) {
      const fullValue = `${selectedCountry.dialCode} ${phoneNumber}`.trim();
      validatePhone(fullValue);
    }
  }, [selectedCountry]);

  return (
    <div className={`phone-input-container ${className}`}>
      {label && (
        <label className="block mb-2 font-medium text-gray-700 text-sm">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      <div className="relative">
        {/* Country Selector */}
        <div className="absolute left-0 top-0 h-full flex items-center">
          <button
            type="button"
            onClick={() => setShowDropdown(!showDropdown)}
            disabled={disabled}
            className="flex items-center gap-2 px-3 py-2 bg-transparent border-none cursor-pointer z-10 hover:bg-gray-50 rounded-l-lg transition-colors"
          >
            <span className="text-lg leading-none">{selectedCountry.flag}</span>
            <span className="text-sm font-medium text-gray-700">{selectedCountry.dialCode}</span>
            <FaChevronDown className={`text-xs text-gray-400 transition-transform duration-200 ${showDropdown ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Phone Input */}
        <input
          type="tel"
          value={phoneNumber}
          onChange={handlePhoneChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full pl-24 pr-10 py-2.5 border-2 rounded-lg text-sm transition-all duration-300 focus:outline-none focus:shadow-md ${
            error || !isValid
              ? 'border-red-300 bg-red-50 focus:border-red-500 focus:bg-red-50'
              : 'border-gray-200 focus:border-blue-500 hover:border-gray-300'
          }`}
          autoComplete="tel"
          aria-label={label || 'Phone number'}
          {...(error || !isValid ? { 'aria-invalid': 'true', 'aria-describedby': 'phone-error' } : {})}
        />

        {/* Phone Icon */}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
          <FaPhone className="text-sm" />
        </div>

        {/* Country Dropdown */}
        {showDropdown && (
          <div className="absolute z-30 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-hidden backdrop-blur-sm">
            {/* Search */}
            <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            </div>

            {/* Country List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredCountries.length === 0 ? (
                <div className="p-4 text-gray-500 text-sm text-center">
                  <FaGlobe className="mx-auto mb-2 text-2xl text-gray-300" />
                  No countries found
                </div>
              ) : (
                filteredCountries.map((country) => (
                  <button
                    key={country.code}
                    type="button"
                    onClick={() => handleCountrySelect(country)}
                    className={`w-full flex items-center gap-3 p-3 text-left hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-200 ${
                      selectedCountry.code === country.code ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-l-4 border-blue-500' : ''
                    }`}
                  >
                    <span className="text-xl leading-none">{country.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 text-sm truncate">{country.name}</div>
                      <div className="text-gray-500 text-xs">{country.dialCode} • {country.minLength}-{country.maxLength} digits</div>
                    </div>
                    {selectedCountry.code === country.code && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error message */}
      {(error || !isValid) && (
        <div 
          id="phone-error"
          className="text-red-500 text-xs mt-1.5 flex items-center gap-1.5"
        >
          <span className="w-1 h-1 bg-red-500 rounded-full"></span>
          {error || errorMessage}
        </div>
      )}

      {/* Click outside to close dropdown */}
      {showDropdown && (
        <div 
          className="fixed inset-0 z-20" 
          onClick={() => setShowDropdown(false)}
        />
      )}
    </div>
  );
};

export default CustomPhoneInput; 