import ComingSoonModule from '@/app/components/ComingSoonModule'

export const metadata = { title: 'Mis Cursos | ISIMOVA' }

export default function MisCursosPage() {
  return (
    <div className="flex-1 w-full h-full min-h-[80vh] flex items-center justify-center p-6">
      <ComingSoonModule 
        title="Catálogo de Cursos" 
        description="Pronto podrás explorar y matricularte en toda nuestra oferta educativa directamente desde aquí."
        iconPath="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </div>
  )
}
