// Dates in frontmatter are calendar days parsed as UTC midnight; format them in
// UTC so a build machine west of Greenwich doesn't print the day before.
const formatter = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export const formatDate = (date: Date) => formatter.format(date);
