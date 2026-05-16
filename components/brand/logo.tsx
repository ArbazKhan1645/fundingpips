import { cn } from '@/lib/utils';

const logoSrc = '/assets/lordfunded-logo.png';

type BrandMarkProps = {
  className?: string;
  imageClassName?: string;
};

export function BrandMark({ className, imageClassName }: BrandMarkProps) {
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#090806] ring-1 ring-amber-400/25 shadow-lg shadow-amber-500/20',
        className
      )}
    >
      <img
        src={logoSrc}
        alt="Lordfunded logo"
        className={cn('h-full w-full object-cover', imageClassName)}
      />
    </span>
  );
}

type BrandLogoProps = BrandMarkProps & {
  textClassName?: string;
};

export function BrandLogo({ className, imageClassName, textClassName }: BrandLogoProps) {
  return (
    <>
      <BrandMark className={className} imageClassName={imageClassName} />
      <span className={cn('font-bold text-white tracking-tight', textClassName)}>
        Lord<span className="gradient-text-blue">funded</span>
      </span>
    </>
  );
}
