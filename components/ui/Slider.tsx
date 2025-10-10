"use client"
import * as RadixSlider from '@radix-ui/react-slider';

interface SliderProps {
    value?: number,
    onChange?: (value: number) => void
}

const Slider: React.FC<SliderProps> = ({value = 1, onChange}) => {
    const handleChange = (newValue: number[]) => {
        onChange?.(newValue[0])
    }
   
    return (
        <RadixSlider.Root 
            className='relative flex items-center select-none touch-none w-full h-10 '
            defaultValue={[1]}
            value={[value]}    
            onValueChange={handleChange}
            max={1}
            step={0.1}
            aria-label='Volume'
        >
            <RadixSlider.Track className='bg-neutral-700 relative grow rounded-full h-[4px]'>
  <RadixSlider.Range className='absolute bg-green-500 rounded-full h-full shadow-lg shadow-green-500/25'> 
  </RadixSlider.Range>
</RadixSlider.Track>
<RadixSlider.Thumb 
  className="block w-4 h-4 bg-white rounded-full shadow-lg hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-green-400"
/>
        </RadixSlider.Root>
    );
}
 
export default Slider;