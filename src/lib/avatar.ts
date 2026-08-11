// "Ardi Rahmadan" -> "AR". Dipakai sidebar & modal profil.
export function getInitials(name: string) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
  return initials || '?';
}