import Stripe from "stripe";

export interface Song {
    id: string ,
    user_id: string,
    author: string,
    title: string,
    song_path: string,
    image_path: string
}

export interface UserDetails {
    id: string;
    first_name: string;
    last_name: string;
    full_name?: string;
    avatar_url?: string;
    billing_address?: Stripe.Address;
    payment_method?: Stripe.PaymentMethod[Stripe.PaymentMethod.Type];
}

export interface Product {
    id: string;
    active?: boolean;
    name?: string;
    description?: string;
    images?: string;
    metadata?: Stripe.Metadata;
}

export interface Price {
    id: string;
    product_id?: string;
    active?: boolean;
    description?: string;
    unit_amount?: number;
    currency?: string;
    type?: Stripe.Price.Type;
    interval?: Stripe.Price.Recurring.Interval;
    interval_count?: number;
    trial_period_days?: number | null;
    metadata?: Stripe.Metadata;
    products?: Product;
}

export interface Subscription {
    id: string;
    user_id: string;
    status?: Stripe.Subscription.Status;
    metadata?: Stripe.Metadata;
    price_id?: string;
    quantity?: number;
    cancel_at_period_end?: boolean;
    created: string;
    current_period_start: string;
    current_period_end: string;
    ended_at?: string;
    cacel_at?: string;
    canceled_at?: string;
    trail_start?: string;
    trail_end?: string;
    prices?: Price;
}

export interface Playlist {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  image_path: string | null;
  created_at: string;
  updated_at: string;
  nft_token_id?: string;
  nft_serial_number?: string;
  nft_metadata_uri?: string; // Add this field
}

export interface PlaylistWithSongs extends Playlist {
  songs: Song[];
}

export interface PlaylistSong {
  id: string;
  playlist_id: string;
  song_id: string;
  position: number;
  added_at: string;
}