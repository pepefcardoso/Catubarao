# Narrative Touchpoints: Operation Rescue

The language we use across the platform is a core pillar of the club's credibility. Every notification, email, and error message must align with the "Operation Rescue" positioning. We are rallying the community to rebuild Clube Atlético Tubarão. We must communicate with transparency, resilience, and belonging. Future developers must never write generic SaaS copy; every user interaction is a narrative moment that reinforces the club's voice.

## Master Table: User-Facing Surfaces

### Public Routes `(public)`
| Surface / Route | Narrative Moment | Emotional Register | Copy Anchor Phrase (from `copy.ts`) |
| --- | --- | --- | --- |
| `/` (Landing) | Call to arms for the community to join the rescue | Urgent, Inspiring | *N/A (Uses dynamic copy, but spirit is "Reconstrução")* |
| `/muro` | Displaying transparency and collective effort | Proud, Grateful | *N/A (Visual representation of support)* |
| `/privacidade` | Commitment to transparency extends to user data | Direct, Trustworthy | *N/A* |
| `/signup` | The first step into the family | Welcoming, Important | "Você está a 2 minutos de fazer parte da história." |
| `/socios` | The collective power of the fans | Unifying, Powerful | *N/A* |
| `/transparencia` | Full accountability and open books | Serious, Transparent | "Sem segredos. Sem desculpas. Os números estão aqui." |

### Member Routes `(member)`
| Surface / Route | Narrative Moment | Emotional Register | Copy Anchor Phrase (from `copy.ts`) |
| --- | --- | --- | --- |
| `/card` | Proof of loyalty and belonging | Proud, Exclusive | *N/A* |
| `/checkout` | The act of financial commitment | Grateful, Secure | *N/A* |
| `/dashboard` | Tracking personal and collective impact | Encouraging, Transparent | "Olá, {name}. Sua contribuição este mês: R${amount}. Juntos já contribuímos R${total}." |
| `/payments` | Financial accountability and history | Clear, Organized | *N/A* |
| `/pedidos` | Tracking contributions through the store | Appreciative | *N/A* |
| `/plans` | Choosing how to help the rescue | Empowering | "Cada plano é um tijolo na reconstrução. Escolha o seu." |
| `/polls` | Having a voice in the club's future | Democratic, Engaging | *N/A* |
| `/welcome` | Celebrating a new member joining the cause | Celebratory, Warm | "Bem-vindo à família, {name}! Você é o sócio nº {memberNumber}." |

### Email Templates
| Template | Narrative Moment | Emotional Register | Copy Anchor Idea |
| --- | --- | --- | --- |
| `WelcomeEmail` | Induction into the family | Warm, Celebratory | "Bem-vindo à família, {name}!" |
| `PaymentConfirmedEmail` | Receipt of a vital contribution | Grateful, Transparent | "Sua contribuição fortalece o Tubarão." |
| `DelinquencyD1Email` | A gentle reminder to a family member | Understanding, Helpful | "O Tubarão sente sua falta. Volte para a reconstrução." |
| `DelinquencyD7Email` | Re-emphasizing the importance of their help | Urgent but Respectful | "Precisamos de você no time." |
| `DelinquencyD15Email` | Warning before suspension of benefits | Serious, Direct | "Não deixe sua carteirinha expirar." |
| `SuspensionEmail` | Formal suspension, but the door remains open | Regretful, Firm | "Seus benefícios foram suspensos, mas o clube ainda é sua casa." |
| `ReactivationEmail` | Welcoming a member back to the fold | Enthusiastic, Forgiving | "Que bom ter você de volta no jogo." |
| `PollOpenEmail` | Empowering the member to vote | Democratic, Urgent | "Sua voz decide o futuro do clube. Vote agora." |
| `VotingUnlockedEmail` | Earning the right to vote through loyalty | Proud, Rewarding | "Você provou seu compromisso. Seu voto está liberado." |
| `ReferralSuccessEmail` | A member successfully recruited another fan | Thrilled, Grateful | "A família cresceu graças a você." |
| `StreakMilestoneEmail` | Celebrating consecutive months of contribution | Proud, Honored | "Sua lealdade é o nosso maior troféu." |
| `AnniversaryEmail` | Celebrating the anniversary of their membership | Nostalgic, Appreciative | "Hoje completamos mais um ano de história juntos." |
| `DealExpirationEmail` | Warning a partner that their sponsorship deal is ending | Professional, Forward-looking | "O tempo passa, mas a parceria pode continuar." |
| `LowStockEmail` | Internal warning about store stock running out | Urgent, Operational | "Alerta na lojinha: o estoque está na reserva." |

## Error Message Guidance
Even when things break, we remain in character. Never use generic technical language for user-facing errors.

**Rule of Thumb:**
- **404 (Not Found):** Use club-themed navigation errors.
  *Example:* `"Essa página se perdeu no campo. Volte para o início."`
- **500 (Internal Error):** Acknowledge the stumble, promise a fix, and maintain trust.
  *Example:* `"Tivemos um tropeço técnico. Nossa equipe já está no vestiário resolvendo isso."`

## Copy Review Checklist
Before merging any PR with user-facing copy changes, ask these 5 questions:
1. **Is it generic?** (Could this text belong to a banking app or SaaS?)
2. **Does it respect the situation?** (Are we being too playful during a serious financial transaction?)
3. **Does it foster belonging?** (Does the user feel like a fan/partner rather than a customer?)
4. **Is it clear?** (We must be clever, but never at the expense of clarity and accessibility.)
5. **Does it exist in `copy.ts`?** (If it's an anchor phrase, it belongs in the central copy dictionary.)

## Forbidden Patterns
Avoid generic SaaS language. Replace it with contextual, club-aligned copy.

| Forbidden Phrase | Why to Avoid | Suggested Alternative |
| --- | --- | --- |
| "Please try again" | Sounds robotic and frustrating | "Tente novamente." or "Vamos tentar outro passe." |
| "An error occurred" | Too technical, lacks empathy | "Tivemos um problema técnico no campo." |
| "Your request has been submitted" | Cold, bureaucratic | "Recebemos sua jogada. Em breve te damos o retorno." |
| "Success" or "Successfully updated" | Generic placeholder | "Tudo certo! Dados atualizados na súmula." |
| "Click here" | Bad accessibility, uninspiring | "Veja os detalhes" or "Acesse o portal" |
| "User not found" | Database-speak | "Não encontramos esse torcedor." |
| "Invalid credentials" | Too technical | "E-mail ou senha incorretos." |
| "Welcome to our platform" | Startup jargon | "Bem-vindo à família Tubarão." |
| "Subscribe now" | Transactional | "Junte-se à reconstrução" |
| "Payment failed" | Blunt and discouraging | "Tivemos um problema com seu pagamento. Vamos tentar outro cartão?" |
