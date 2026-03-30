import ComingSoonModule from '@/app/components/ComingSoonModule'

export const metadata = { title: 'Comunidad | ISIMOVA' }

export default function ComunidadPage() {
  return (
    <div className="flex-1 w-full h-full min-h-[80vh] flex items-center justify-center p-6">
      <ComingSoonModule 
        title="Espacio de Comunidad" 
        description="El foro de discusión en vivo donde podrás debatir, compartir dudas y aprender socialmente con otros estudiantes y mentores."
        iconPath="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 7a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75"
      />
    </div>
  )
}
