export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function formatTimeAgo(dateString: string): string {
  const target = new Date(dateString).getTime();
  const diff = Date.now() - target;

  if (diff < 60 * 1000) {
    return "数秒前";
  }
  if (diff < 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 1000))}分前`;
  }
  if (diff < 24 * 60 * 60 * 1000) {
    return `${Math.floor(diff / (60 * 60 * 1000))}時間前`;
  }
  return formatDate(dateString);
}
