import { twMerge } from 'tailwind-merge';
import classnames from 'classnames';
import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<
  { className?: string } & React.HTMLAttributes<HTMLButtonElement>
>;

export const Button = (props: Props) => {
  const { className, children, ...rest } = props;

  return (
    <button
      className={twMerge(
        classnames(
          'flex flex-col gap-4 rounded-lg bg-slate-500 text-white font-bold w-fit p-4',
          { [`${className}`]: className },
        ),
      )}
      {...rest}
    >
      {children}
    </button>
  );
};
