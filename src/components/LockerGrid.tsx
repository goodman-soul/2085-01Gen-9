import { Locker } from '@/types';
import LockerCard from './LockerCard';

interface LockerGridProps {
  lockers: Locker[];
  onSelectLocker?: (locker: Locker) => void;
  selectedId?: string;
}

export default function LockerGrid({ lockers, onSelectLocker, selectedId }: LockerGridProps) {
  return (
    <div className="grid grid-cols-5 gap-4">
      {lockers.map((locker) => (
        <LockerCard
          key={locker.id}
          locker={locker}
          onClick={() => onSelectLocker?.(locker)}
          selected={selectedId === locker.id}
        />
      ))}
    </div>
  );
}
