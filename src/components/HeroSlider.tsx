
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

interface SliderImage {
  id: string;
  title: string;
  image_url: string;
  description: string;
  order_index: number;
}

export const HeroSlider = () => {
  const { data: images = [] } = useQuery({
    queryKey: ['slider-images'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('slider_images')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      return data as SliderImage[];
    },
  });

  if (images.length === 0) {
    return (
      <div className="w-full h-96 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Welcome to Chemouflage</h2>
          <p className="text-lg">Experience Chemistry in Augmented Reality</p>
        </div>
      </div>
    );
  }

  return (
    <Carousel className="w-full max-w-6xl mx-auto">
      <CarouselContent>
        {images.map((image) => (
          <CarouselItem key={image.id}>
            <div className="relative h-96 w-full rounded-lg overflow-hidden">
              <img
                src={image.image_url}
                alt={image.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="text-center text-white">
                  <h2 className="text-4xl font-bold mb-4">{image.title}</h2>
                  <p className="text-lg">{image.description}</p>
                </div>
              </div>
            </div>
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};
