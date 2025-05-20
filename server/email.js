// server/email.js
import nodemailer from 'nodemailer';
import { log } from '../client/debug.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const _fileName = "email";
const _DebugBool = true;

// Email configuration from environment variables
const EMAIL_CONFIG = {
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
};

// Default sender details from environment variables
const DEFAULT_SENDER = {
  name: process.env.SENDER_NAME || 'Your Company',
  email: process.env.SENDER_EMAIL || 'noreply@example.com'
};

// Default contact recipient
export const CONTACT_RECIPIENT = process.env.CONTACT_RECIPIENT || 'contact@example.com';

// Create a reusable transporter object
let transporter;

/**
 * Initialize the email transporter
 */
function initializeTransporter() {
  try {
    // Log environment variables availability (without logging actual values)
    log(_fileName, _DebugBool, `SMTP Configuration - Host: ${!!process.env.SMTP_HOST}, User: ${!!process.env.SMTP_USER}, Pass: ${!!process.env.SMTP_PASS ? 'set' : 'not set'}`);
    
    transporter = nodemailer.createTransport(EMAIL_CONFIG);
    log(_fileName, _DebugBool, 'Email transporter initialized');
  } catch (error) {
    log(_fileName, _DebugBool, `Failed to initialize email transporter: ${error.message}`);
    throw error;
  }
}

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.replyTo - Email to reply to
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text version of the email
 * @param {string} options.html - HTML version of the email (optional)
 * @returns {Promise} - Promise that resolves with mail info
 */
async function sendEmail(options) {
    if (!transporter) {
      initializeTransporter();
    }
  
    try {
      // Log all email options for debugging
      log(_fileName, _DebugBool, 'Email send attempt with options:');
      log(_fileName, _DebugBool, `- To: "${options.to}"`);
      log(_fileName, _DebugBool, `- Reply-To: "${options.replyTo}"`);
      log(_fileName, _DebugBool, `- Subject: "${options.subject}"`);
      log(_fileName, _DebugBool, `- From: "${DEFAULT_SENDER.name}" <${DEFAULT_SENDER.email}>`);
      
      // Check if recipient is valid
      if (!options.to || options.to === 'contact@example.com') {
        log(_fileName, _DebugBool, 'WARNING: Using default recipient. Did you set CONTACT_RECIPIENT in your .env file?');
      }
      
      const mailOptions = {
        from: `"${DEFAULT_SENDER.name}" <${DEFAULT_SENDER.email}>`,
        to: options.to,
        replyTo: options.replyTo,
        subject: options.subject,
        text: options.text,
      };
      
      // Add HTML content if provided
      if (options.html) {
        mailOptions.html = options.html;
      }
      
      log(_fileName, _DebugBool, 'Attempting to send email via nodemailer...');
      const info = await transporter.sendMail(mailOptions);
      log(_fileName, _DebugBool, `Email sent successfully with ID: ${info.messageId}`);
      log(_fileName, _DebugBool, `Email response: ${info.response}`);
      return info;
    } catch (error) {
      log(_fileName, _DebugBool, '=============== EMAIL ERROR ===============');
      log(_fileName, _DebugBool, `Error sending email: ${error.message}`);
      log(_fileName, _DebugBool, `Error code: ${error.code || 'N/A'}`);
      log(_fileName, _DebugBool, `Error response: ${error.response || 'N/A'}`);
      log(_fileName, _DebugBool, '===========================================');
      throw error;
    }
  }

export { sendEmail, initializeTransporter };