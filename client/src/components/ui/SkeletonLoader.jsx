export default function SkeletonLoader({ lines = 3 }) {
  return (
    <div className="space-y-2 animate-pulse">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className="bg-gray-700 h-4 w-full rounded"></div>
      ))}
    </div>
  );
}
