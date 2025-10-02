import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { RewardfulWebhookPayload } from '@/lib/types';

// Webhook endpoint for Rewardful events
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('rewardful-signature');
    const webhookSecret = process.env.REWARDFUL_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error('Rewardful webhook secret not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // TODO: Verify webhook signature
    // In production, you should verify the webhook signature to ensure it's from Rewardful
    // const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
    // if (signature !== expectedSignature) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }

    const payload: RewardfulWebhookPayload = JSON.parse(body);

    console.log('Rewardful webhook received:', payload.type, payload.data);

    switch (payload.type) {
      case 'referral.created':
        await handleReferralCreated(payload);
        break;

      case 'referral.converted':
        await handleReferralConverted(payload);
        break;

      case 'commission.created':
        await handleCommissionCreated(payload);
        break;

      case 'commission.paid':
        await handleCommissionPaid(payload);
        break;

      default:
        console.log('Unhandled webhook event:', payload.type);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error processing Rewardful webhook:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function handleReferralCreated(payload: RewardfulWebhookPayload) {
  console.log('New referral created:', payload.data);

  // TODO: Log referral creation in your database
  // This could include updating user stats, sending notifications, etc.
}

async function handleReferralConverted(payload: RewardfulWebhookPayload) {
  console.log('Referral converted:', payload.data);

  // TODO: Handle successful conversion
  // This is where you might:
  // - Update affiliate earnings in your database
  // - Send conversion notification emails
  // - Update analytics/reporting data
  // - Trigger any post-conversion workflows
}

async function handleCommissionCreated(payload: RewardfulWebhookPayload) {
  console.log('Commission created:', payload.data);

  // TODO: Record commission in your database
  // This happens when a commission is calculated and awaiting payment
}

async function handleCommissionPaid(payload: RewardfulWebhookPayload) {
  console.log('Commission paid:', payload.data);

  // TODO: Update commission status in your database
  // This happens when Rewardful actually pays out the commission
}