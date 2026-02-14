import { db } from "@/src/server/db/client";
import { notifications } from "@/src/server/db/schema";

type NotificationType =
  | "report_verified"
  | "report_commented"
  | "report_upvoted"
  | "new_follower_report"
  | "badge_earned"
  | "reputation_milestone";

interface CreateNotificationParams {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Creates a notification for a user.
 */
export async function createNotification({
  userId,
  type,
  title,
  message,
  metadata = {},
}: CreateNotificationParams): Promise<void> {
  await db.insert(notifications).values({
    userId,
    type,
    title,
    message,
    metadata,
  });
}

/**
 * Creates a notification when a user's report is verified.
 */
export async function notifyReportVerified(
  userId: number,
  reportId: number,
  itemName: string
): Promise<void> {
  await createNotification({
    userId,
    type: "report_verified",
    title: "Report Verified",
    message: `Your price report for ${itemName} has been verified`,
    metadata: { reportId, itemName },
  });
}

/**
 * Creates a notification when someone comments on a user's report.
 */
export async function notifyReportCommented(
  userId: number,
  reportId: number,
  itemName: string,
  commenterName: string
): Promise<void> {
  await createNotification({
    userId,
    type: "report_commented",
    title: "New Comment",
    message: `${commenterName} commented on your ${itemName} report`,
    metadata: { reportId, itemName, commenterName },
  });
}

/**
 * Creates a notification when someone upvotes a user's report.
 */
export async function notifyReportUpvoted(
  userId: number,
  reportId: number,
  itemName: string,
  voterName: string
): Promise<void> {
  await createNotification({
    userId,
    type: "report_upvoted",
    title: "Helpful Vote",
    message: `${voterName} found your ${itemName} report helpful`,
    metadata: { reportId, itemName, voterName },
  });
}

/**
 * Creates a notification when a user earns a badge.
 */
export async function notifyBadgeEarned(
  userId: number,
  badgeName: string,
  badgeDescription: string
): Promise<void> {
  await createNotification({
    userId,
    type: "badge_earned",
    title: "Badge Earned!",
    message: `You earned the "${badgeName}" badge: ${badgeDescription}`,
    metadata: { badgeName, badgeDescription },
  });
}

/**
 * Creates a notification for reputation milestones.
 */
export async function notifyReputationMilestone(
  userId: number,
  reputation: number
): Promise<void> {
  await createNotification({
    userId,
    type: "reputation_milestone",
    title: "Reputation Milestone",
    message: `Congratulations! You've reached ${reputation} reputation points`,
    metadata: { reputation },
  });
}
