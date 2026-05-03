import * as React from 'react';

declare module 'react' {
  // Restore React 17's implicit children for React.FC in React 18
  interface FunctionComponent<P = {}> {
    (props: P & { children?: React.ReactNode }, context?: any): React.ReactElement<any, any> | null;
  }
}
