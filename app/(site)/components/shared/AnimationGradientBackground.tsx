const dynamicGradients = [
  "linear-gradient(135deg, #6a11cb 0%, #2575fc 50%, #6a11cb 100%)",
  "linear-gradient(135deg, #ff9a9e 0%, #fad0c4 50%, #ff9a9e 100%)",
  "linear-gradient(135deg, #0cebeb 0%, #20e3b2 50%, #29ffc6 100%)",
  "linear-gradient(135deg, #8360c3 0%, #2ebf91 50%, #8360c3 100%)",
  "linear-gradient(135deg, #ff5e62 0%, #ff9966 50%, #ff5e62 100%)",
  "linear-gradient(135deg, #42e695 0%, #3bb2b8 50%, #42e695 100%)",
  "linear-gradient(135deg, #ff7e5f 0%, #feb47b 50%, #ff7e5f 100%)",
  "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #667eea 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #f093fb 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 50%, #4facfe 100%)"
];

interface AnimatedGradientBackgroundProps {
  gradientIndex: number;
}

export const AnimatedGradientBackground: React.FC<AnimatedGradientBackgroundProps> = ({ 
  gradientIndex 
}) => {
  const gradient = dynamicGradients[gradientIndex % dynamicGradients.length];
  
  return (
    <div 
      className="absolute inset-0 opacity-80"
      style={{
        background: gradient,
        backgroundSize: '200% 200%',
        animation: `gradientShift 8s ease infinite`,
      }}
    />
  );
};