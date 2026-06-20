export function MemberFooter() {
  return (
    <footer className="border-t py-6 md:py-0 bg-muted/20">
      <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row px-4 md:px-6">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} Clube Atlético Tubarão SAF. Todos os direitos reservados.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a href="/termos" className="hover:underline underline-offset-4">Termos</a>
          <a href="/privacidade" className="hover:underline underline-offset-4">Privacidade</a>
          <a href="/suporte" className="hover:underline underline-offset-4">Suporte</a>
        </div>
      </div>
    </footer>
  );
}
