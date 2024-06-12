export const WarningOutlineIcon: React.FC<{ size: string, fill: string }> = ({ size, fill }) => {
  return (
    <svg height={size} width={size} fill={fill} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="10" style={{ fill: 'none', stroke: fill, strokeWidth: '2' }} />
      <line x1="8" y1="8" x2="16" y2="16" style={{ stroke: fill, strokeWidth: '2', strokeLinecap: 'round' }} />
      <line x1="16" y1="8" x2="8" y2="16" style={{ stroke: fill, strokeWidth: '2', strokeLinecap: 'round' }} />
    </svg>
  )
}
