import { twMerge } from 'tailwind-merge';
import classnames from 'classnames';
import { PropsWithChildren } from 'react';

type Props = PropsWithChildren<{ className?: string }>;

export const Layout = (props: Props) => {
  const { className, children } = props;
  return (
    <main
      className={twMerge(
        classnames('flex flex-col gap-4 p-4 max-w-screen-lg mx-auto', {
          [`${className}`]: className,
        }),
      )}
    >
      {children}
    </main>
  );
};
