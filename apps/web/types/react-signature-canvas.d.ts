declare module 'react-signature-canvas' {
  import { Component } from 'react';

  interface SignatureCanvasProps {
    penColor?: string;
    canvasProps?: React.CanvasHTMLAttributes<HTMLCanvasElement>;
    backgroundColor?: string;
    minWidth?: number;
    maxWidth?: number;
    velocityFilterWeight?: number;
    onEnd?: () => void;
    onBegin?: () => void;
    clearOnResize?: boolean;
  }

  export default class SignatureCanvas extends Component<SignatureCanvasProps> {
    clear(): void;
    fromDataURL(dataURL: string, options?: { ratio?: number; width?: number; height?: number }): void;
    toDataURL(type?: string, encoderOptions?: number): string;
    isEmpty(): boolean;
  }
}