import { cn } from '../../lib/utils';

type ContactAvatarProps = {
  name: string;
  image: string;
  active?: boolean;
};

export default function ContactAvatar({ name, image, active }: ContactAvatarProps) {
  return (
    <div className="flex flex-col items-center gap-2 snap-start shrink-0">
      <div className={cn('w-16 h-16 rounded-full p-1', active ? 'bg-gradient-to-tr from-violet-500 to-fuchsia-500' : 'bg-transparent')}>
        <img src={image} alt={name} className="w-full h-full rounded-full object-cover border-2 border-white" />
      </div>
      <span className="text-[10px] font-bold text-slate-600 tracking-wider uppercase">{name}</span>
    </div>
  );
}
