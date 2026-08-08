import { useNavigate } from 'react-router-dom'
import { Heart } from 'lucide-react'
import { useFavorites } from '../hooks/useFavorites'
import { ChannelCard } from '../components/ChannelCard'

export function FavoritesPage() {
  const navigate = useNavigate()
  const { favoriteChannels, isFavorite, toggleFavorite } = useFavorites()

  return (
    <main className="pt-safe-margin-y pr-safe-margin-x pb-safe-margin-y pl-safe-margin-x">
      <h1 className="text-headline-md mb-8 font-extrabold tracking-tighter">
        Favorites
      </h1>

      {favoriteChannels.length === 0 ? (
        <div className="text-on-surface-variant flex flex-col items-center gap-3 py-24 text-center">
          <Heart size={40} strokeWidth={1.5} />
          <p>No favorites yet.</p>
          <p className="text-sm">
            Tap the heart on any channel to add it here.
          </p>
        </div>
      ) : (
        <div className="gap-rail-item-spacing grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {favoriteChannels.map((channel, i) => (
            <ChannelCard
              key={channel.stream_id}
              channel={channel}
              isFavorite={isFavorite(channel.stream_id)}
              onSelect={() =>
                navigate(`/watch/${channel.stream_id}`, {
                  state: { channels: favoriteChannels, index: i },
                })
              }
              onToggleFavorite={() => toggleFavorite(channel)}
            />
          ))}
        </div>
      )}
    </main>
  )
}
