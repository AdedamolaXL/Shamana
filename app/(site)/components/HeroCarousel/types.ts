export interface Slide {
  id: number;
  title: string;
  description: string;
  buttonText: string;
  buttonStyle: React.CSSProperties;
  background: string;
  onClickHandler?: () => void;
}