import nodemailer from 'nodemailer';
import aws from '@aws-sdk/client-sesv2';
import { defaultProvider } from '@aws-sdk/credential-provider-node';

const ses = new aws.SES({
  apiVersion: '2010-12-01',
  region: process.env.REGION ,
  defaultProvider,
});

// create Nodemailer SES transporter
const transporter = nodemailer.createTransport({
  SES: { ses, aws },
});

export default transporter;

/**
 * IAM Policy for SES:
 * Nodemailer SES transport requires ses:SendRawEmail role
 * {
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "ses:SendRawEmail",
      "Resource": "*"
    }
  ]
}
 */
