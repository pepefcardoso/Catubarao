import Link from "next/link";
import { Waves, MapPin, Mail, Phone, CreditCard, Truck, ShieldCheck } from "lucide-react";

const footerLinks = {
  categorias: [
    { name: "Uniformes de Jogo", href: "/loja/uniformes" },
    { name: "Treino e Viagem", href: "/loja/treino" },
    { name: "Acessórios", href: "/loja/acessorios" },
    { name: "Infantil", href: "/loja/infantil" },
  ],
  atendimento: [
    { name: "Meus Pedidos", href: "/loja/pedidos" },
    { name: "Trocas e Devoluções", href: "/loja/trocas" },
    { name: "Dúvidas Frequentes", href: "/loja/faq" },
    { name: "Fale Conosco", href: "/loja/contato" },
  ],
  legal: [
    { name: "Termos de Compra", href: "/loja/termos" },
    { name: "Política de Privacidade", href: "/privacidade" },
  ],
};

export function StoreFooter() {
  return (
    <footer className="bg-background border-t border-border/50 pt-16 pb-8">
      {/* Store Features Banner */}
      <div className="border-b border-border/50 pb-12 mb-12">
        <div className="container mx-auto px-4 md:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
              <div className="bg-primary/10 p-4 rounded-full">
                <CreditCard className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Parcele suas compras</h4>
                <p className="text-sm text-muted-foreground">Em até 6x sem juros no cartão</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
              <div className="bg-primary/10 p-4 rounded-full">
                <Truck className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Entrega para todo Brasil</h4>
                <p className="text-sm text-muted-foreground">Frete grátis acima de R$ 299</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-4 justify-center md:justify-start">
              <div className="bg-primary/10 p-4 rounded-full">
                <ShieldCheck className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h4 className="font-semibold">Compra 100% Segura</h4>
                <p className="text-sm text-muted-foreground">Seus dados estão protegidos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <Link href="/loja" className="flex items-center gap-2">
              <div className="bg-primary p-2 rounded-xl">
                <Waves className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-2xl tracking-tight">Tubarão Store</span>
            </Link>
            <p className="text-muted-foreground leading-relaxed max-w-sm">
              A loja oficial do Clube Atlético Tubarão. Vista as cores do Peixe e apoie nosso time
              rumo às vitórias.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
                <span className="sr-only">Instagram</span>
              </Link>
              <Link
                href="#"
                className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
                </svg>
                <span className="sr-only">Twitter</span>
              </Link>
              <Link
                href="#"
                className="p-2 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
                <span className="sr-only">Facebook</span>
              </Link>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Categorias</h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.categorias.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Atendimento</h4>
            <ul className="flex flex-col gap-3">
              {footerLinks.atendimento.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-foreground">Contato Loja</h4>
            <ul className="flex flex-col gap-4">
              <li className="flex items-start gap-3 text-sm text-muted-foreground">
                <MapPin className="w-5 h-5 text-primary shrink-0" />
                <span>
                  Estádio Domingos Silveira Gonzales
                  <br />
                  Loja Anexa
                  <br />
                  Tubarão, SC
                </span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Mail className="w-5 h-5 text-primary shrink-0" />
                <span>loja@tubarao.com.br</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-muted-foreground">
                <Phone className="w-5 h-5 text-primary shrink-0" />
                <span>(48) 3622-0001</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground text-center md:text-left">
            © {new Date().getFullYear()} Tubarão Store - Clube Atlético Tubarão SAF. Todos os
            direitos reservados.
          </p>
          <div className="flex items-center gap-6">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
