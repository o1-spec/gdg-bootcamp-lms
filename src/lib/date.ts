/**
 * Lightweight date formatting utility without external dependencies
 */

export function format(dateInput: Date | string | number, formatStr: string): string {
  const date = typeof dateInput === "string" || typeof dateInput === "number" ? new Date(dateInput) : dateInput;
  if (!date || isNaN(date.getTime())) return "";

  const monthsShort = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const monthsFull = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const daysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const daysFull = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const dayOfWeek = date.getDay();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const hours12 = hours % 12 || 12;
  const ampm = hours >= 12 ? "PM" : "AM";
  const ampmLower = hours >= 12 ? "pm" : "am";

  if (formatStr === "yyyy-MM-dd") {
    return `${year}-${pad(month + 1)}-${pad(day)}`;
  }
  if (formatStr === "HH:mm") {
    return `${pad(hours)}:${pad(minutes)}`;
  }
  if (formatStr === "MMM yyyy") {
    return `${monthsShort[month]} ${year}`;
  }
  if (formatStr === "MMM d, yyyy") {
    return `${monthsShort[month]} ${day}, ${year}`;
  }
  if (formatStr === "MMM d") {
    return `${monthsShort[month]} ${day}`;
  }
  if (formatStr === "PPP") {
    return `${monthsFull[month]} ${day}, ${year}`;
  }
  if (formatStr === "h:mm a") {
    return `${hours12}:${pad(minutes)} ${ampm}`;
  }
  if (formatStr === "EEE, MMM d • h:mm a") {
    return `${daysShort[dayOfWeek]}, ${monthsShort[month]} ${day} • ${hours12}:${pad(minutes)} ${ampmLower}`;
  }
  if (formatStr === "EEEE, MMM d, yyyy • h:mm a") {
    return `${daysFull[dayOfWeek]}, ${monthsShort[month]} ${day}, ${year} • ${hours12}:${pad(minutes)} ${ampmLower}`;
  }
  if (formatStr === "MMM d, yyyy • h:mm a") {
    return `${monthsShort[month]} ${day}, ${year} • ${hours12}:${pad(minutes)} ${ampmLower}`;
  }

  // Generic fallback replacement
  return formatStr
    .replace("yyyy", `${year}`)
    .replace("MMMM", monthsFull[month])
    .replace("MMM", monthsShort[month])
    .replace("MM", pad(month + 1))
    .replace("EEEE", daysFull[dayOfWeek])
    .replace("EEE", daysShort[dayOfWeek])
    .replace("dd", pad(day))
    .replace("d", `${day}`)
    .replace("HH", pad(hours))
    .replace("hh", pad(hours12))
    .replace("h", `${hours12}`)
    .replace("mm", pad(minutes))
    .replace("ss", pad(seconds))
    .replace("a", ampmLower);
}
