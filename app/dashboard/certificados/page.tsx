import ComingSoonModule from '@/app/components/ComingSoonModule'

export const metadata = { title: 'Certificados | ISIMOVA' }

export default function CertificadosPage() {
  return (
    <div className="flex-1 w-full h-full min-h-[80vh] flex items-center justify-center p-6">
      <ComingSoonModule 
        title="Centro de Certificaciones" 
        description="El repositorio criptográfico donde reposarán todos los diplomas PDF de las formaciones que culmines con éxito."
        iconPath="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </div>
  )
}
