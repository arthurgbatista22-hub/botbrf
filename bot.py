"""
The Classic Soccer Federation — Discord Bot
Migrado para discord.py com Components V2 (DesignerView, Container, Section, etc.)
"""

import discord
from discord.ext import commands
from discord import option
import json
import os
import asyncio
import time
import datetime
import random

# ══════════════════════════════════════════════════════════
# ⚙️  CONFIGURAÇÕES GERAIS
# ══════════════════════════════════════════════════════════

TOKEN = os.getenv("DISCORD_TOKEN")

ALLOWED_COMMAND_ROLES = [
    1491439508309278831,
    1491448375881498665,
]

INTERNATIONAL_ROLES = [
    1495837043241127936, 1495839806125637793, 1495839939211034745,
    1495840082202984600, 1495842308212396147, 1495845204257800202,
    1495843776646615151, 1495844968688783541, 1495844804762800209,
    1495845313208909885, 1495845124897505400, 1495845257362018325,
    1495845838948274377, 1495846561979170917, 1495845493110997194,
    1495847790415450252, 1495849573770592399, 1495845878433583115,
    1495846108683964427, 1495880676296232981, 1495845533300949253,
    1495845726092267561, 1495846858218672128, 1495845161991672038,
    1495844849482465290,
]

ALLOWED_TEAM_ROLES = [
    1491626081680232488, 1491626182276284466, 1491626270557999127,
    1491626367614451823, 1491626509629128834, 1491626604672192633,
    1491626684061843536, 1491627187265343498, 1491627290629636186,
    1491627452903198720, 1491931433457946754, 1491934575914389586,
    1491934655262494870, 1491934695049531505, 1491934860585996521,
    1491934946187542589, 1491935127234805958, 1491935298840559807,
    1491935469372702810, 1491935723673092237,
]

FA_ROLE_ID = 1492562238761074870
CONTRACT_EXPIRATION_SECONDS = 24 * 60 * 60

REACTION_ROLES_CHANNEL = 1492347556053778432
FA_ANNOUNCEMENT_CHANNEL = 1491439241090170971
CONTRACT_ANNOUNCEMENT_CHANNEL = 1491447652422914220
SCOUTING_ANNOUNCEMENT_CHANNEL = 1491447682764636332
FRIENDLY_ANNOUNCEMENT_CHANNEL = 1492659295819403385
HELP_AUTO_CHANNEL = 1494336905104331014

ALLOWED_FA_CHANNELS = [1491433748774912140]
ALLOWED_CONTRACT_CHANNELS = [1491433748774912140]
ALLOWED_SCOUTING_CHANNELS = [1491433748774912140]
ALLOWED_RELEASE_CHANNELS = [1492354496259428392]
ALLOWED_FRIENDLY_CHANNELS = [1491433748774912140]

ALLOWED_ROBLOX_LINK_CHANNELS = [
    1491438344130007332, 1491439536545202216, 1491439591654166618,
    1492342601758544033, 1495443477045968958,
]

ALLOWED_ANNOUNCE_ROLES = [
    1491438719201181717, 1491439004149747842, 1491438424685805608,
    1491438613379153990, 1491437519760261178, 1491437072547057805,
    1491436528725917888, 1491436756678217819, 1491081676158275615,
    1492378748610412575, 1495428206264713308,
]

REACTION_ROLES = [
    {"emoji": "⚙️", "role_id": 1492348332700471458, "label": "Scrim Ping",  "description": "Quer ser notificado quando estiver tendo scrim?"},
    {"emoji": "🎉", "role_id": 1492348735437668472, "label": "Fun Ping",    "description": "Quer ser notificado sobre eventos e diversão?"},
    {"emoji": "⚽", "role_id": 1492348557812961422, "label": "Match Ping",  "description": "Quer ser notificado quando estiver acontecendo uma partida?"},
    {"emoji": "📸", "role_id": 1492348457015578736, "label": "Media Ping",  "description": "Quer ter acesso a toda categoria de media?"},
]

PING_INTERVAL = 2 * 24 * 60 * 60  # 2 dias em segundos

REACTION_MSG_FILE = "./reaction_message.json"
PING_INTERVAL_FILE = "./last_ping.json"
TRANSFER_WINDOW_FILE = "./transfer_window.json"
CONTRACTS_FILE = "./contratos.json"

import re
INVITE_REGEX = re.compile(
    r"(discord\.(gg|io|me|li)|discordapp\.com\/invite|discord\.com\/invite)\/[a-zA-Z0-9]+",
    re.IGNORECASE
)
DIVULGACAO_REGEX = re.compile(r"^algu[eé]m\s+quer\s+entrar", re.IGNORECASE)
ROBLOX_PRIVATE_SERVER_REGEX = re.compile(r"https://www\.roblox\.com/share\?code=", re.IGNORECASE)

AUTO_RESPONSES = [
    {
        "keywords": ["como uso fa", "como usar fa", "como faço fa", "como faz fa",
                     "free agent como", "como viro fa", "quero ser fa", "como posto fa",
                     "como uso free agent", "como usar free agent"],
        "response": "📢 Para se anunciar como **Free Agent**, use o comando `/fa` no canal <#1491433748774912140>!"
    },
    {
        "keywords": ["como uso contract", "como usar contract", "como faço contract",
                     "como envio contrato", "como mando contrato", "como criar contrato",
                     "como contratar jogador", "como propor contrato", "como fazer contrato"],
        "response": "📋 Para propor um **Contrato**, use o comando `/contract` no canal <#1491433748774912140>!"
    },
    {
        "keywords": ["como uso scouting", "como usar scouting", "como faço scouting",
                     "como anuncio scouting", "como postar scouting", "como recrutar jogador"],
        "response": "🔍 Para anunciar um **Scouting**, use o comando `/scouting` no canal <#1491433748774912140>!"
    },
    {
        "keywords": ["como uso friendly", "como usar friendly", "como faço friendly",
                     "como marcar friendly", "como agendar friendly", "quero fazer friendly"],
        "response": "⚽ Para solicitar um **Friendly**, use o comando `/friendly` no canal <#1491433748774912140>!"
    },
    {
        "keywords": ["como uso release", "como usar release", "como faço release",
                     "como sair do time", "como me liberar", "quero sair do time"],
        "response": "🔓 Para se **liberar de um time**, use o comando `/release` no canal <#1492354496259428392>!"
    },
]

TICKET_AUTO_RESPONSES = [
    {
        "keywords": ["ownar", "quero ownar", "como ownar"],
        "title": "👑 Como Ownar um Time",
        "description": (
            "Para ownar um time na **The Classic Soccer Federation**, siga os passos:\n\n"
            "1️⃣ Monte sua **squad (squadsheet)**\n"
            "2️⃣ Envie sua squadsheet neste ticket\n"
            "3️⃣ Aguarde a análise da staff\n\n"
            "⚠️ Apenas squads organizadas serão aceitas.\n\n"
            "📌 Um staff irá te responder em breve."
        ),
    },
    {
        "keywords": ["parceria", "partner", "parceiro"],
        "title": "🤝 Parceria",
        "description": (
            "Para fazer uma parceria com a liga:\n\n"
            "📌 Envie as seguintes informações:\n"
            "• Link de convite\n"
            "• Quantidade de membros\n"
            "⏳ Aguarde um staff analisar seu pedido."
        ),
    },
    {
        "keywords": ["suporte", "ajuda", "help", "denuncia"],
        "title": "🆘 Suporte",
        "description": (
            "Explique seu problema com o máximo de detalhes possível.\n\n"
            "📌 Um membro da staff irá te ajudar em breve.\n\n"
            "⏳ Aguarde..."
        ),
    },
]

# ══════════════════════════════════════════════════════════
# 💾  PERSISTÊNCIA
# ══════════════════════════════════════════════════════════

def load_json(path, default):
    if not os.path.exists(path):
        return default
    try:
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return default

def save_json(path, data):
    with open(path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# ══════════════════════════════════════════════════════════
# 🤖  BOT
# ══════════════════════════════════════════════════════════

intents = discord.Intents.default()
intents.message_content = True
intents.members = True
intents.reactions = True

bot = commands.Bot(intents=intents)

# Estado em memória
pending_contracts: dict = {}   # contractId -> dict
active_contracts: dict = {}    # contractId -> dict
expiration_tasks: dict = {}    # contractId -> asyncio.Task

transfer_window = {"clubs": False, "internacional": True}
reaction_message_id: int | None = None
last_ping_time: float | None = None

# ══════════════════════════════════════════════════════════
# 🛠️  HELPERS
# ══════════════════════════════════════════════════════════

def has_command_permission(member: discord.Member) -> bool:
    return any(r.id in ALLOWED_COMMAND_ROLES for r in member.roles)

def is_role_allowed(role: discord.Role) -> bool:
    return role.id in ALLOWED_TEAM_ROLES or role.id in INTERNATIONAL_ROLES

def generate_contract_id() -> str:
    return f"T{int(time.time() * 1000)}_{random.randint(0, 9_999_999_999)}"

def fmt_timestamp(ts: float) -> str:
    return f"<t:{int(ts)}:F>"

def save_reaction_message_id(mid: int):
    save_json(REACTION_MSG_FILE, {"messageId": mid})

def load_reaction_message_id() -> int | None:
    data = load_json(REACTION_MSG_FILE, {})
    return data.get("messageId")

def save_last_ping():
    save_json(PING_INTERVAL_FILE, {"lastPing": time.time()})

def load_last_ping() -> float | None:
    data = load_json(PING_INTERVAL_FILE, {})
    return data.get("lastPing")

def save_transfer_window():
    save_json(TRANSFER_WINDOW_FILE, transfer_window)

def load_transfer_window():
    data = load_json(TRANSFER_WINDOW_FILE, {"clubs": False, "internacional": True})
    transfer_window["clubs"] = data.get("clubs", False)
    transfer_window["internacional"] = data.get("internacional", True)

def save_contracts():
    serializable = {}
    for cid, c in active_contracts.items():
        serializable[cid] = {
            "contract_id": c["contract_id"],
            "signee_id": c["signee_id"],
            "signee_username": c["signee_username"],
            "contractor_id": c["contractor_id"],
            "contractor_username": c["contractor_username"],
            "team_name": c["team_name"],
            "team_role_id": c["team_role_id"],
            "position": c["position"],
            "role": c["role"],
            "proposed_at": c["proposed_at"],
            "signed_at": c["signed_at"],
            "expires_at": c["expires_at"],
            "guild_id": c["guild_id"],
        }
    save_json(CONTRACTS_FILE, serializable)

# ══════════════════════════════════════════════════════════
# 🧩  COMPONENTS V2 — BUILDERS
# ══════════════════════════════════════════════════════════

def v2_error(title: str, description: str) -> discord.ui.DesignerView:
    """Card de erro genérico."""
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.Section(
                discord.ui.TextDisplay(content=f"## {title}"),
                discord.ui.TextDisplay(content=description),
                discord.ui.TextDisplay(content="-# The Classic Soccer Federation"),
            ),
        )
    )

def v2_success(title: str, description: str) -> discord.ui.DesignerView:
    """Card de sucesso genérico."""
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.Section(
                discord.ui.TextDisplay(content=f"## {title}"),
                discord.ui.TextDisplay(content=description),
                discord.ui.TextDisplay(content="-# The Classic Soccer Federation"),
            ),
        )
    )

def v2_help() -> discord.ui.DesignerView:
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.TextDisplay(content="## 📖 Central de Comandos"),
            discord.ui.TextDisplay(content="Veja todos os comandos disponíveis abaixo:"),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="**📋 /contract** — Envia proposta de contrato\n`Uso: /contract jogador time posicao role`"),
            discord.ui.Separator(divider=False, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="**🌍 /fa** — Se tornar Free Agent\n`Uso: /fa posicao exp plataforma`"),
            discord.ui.Separator(divider=False, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="**🔓 /release** — Se liberar de um time\n`Uso: /release`"),
            discord.ui.Separator(divider=False, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="**🤝 /friendly** — Criar pedido de amistoso\n`Uso: /friendly sobre`"),
            discord.ui.Separator(divider=False, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="**🔍 /scouting** — Criar scouting de clube\n`Uso: /scouting time posicao sobre`"),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation • Sistema Oficial"),
        )
    )

def v2_reaction_roles() -> discord.ui.DesignerView:
    lines = "\n".join(f"{r['emoji']} — {r['description']}" for r in REACTION_ROLES)
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.TextDisplay(content="## 🎭 Cargos por Reação"),
            discord.ui.TextDisplay(
                content="Você que está no comando de quando você será mencionado\n\n" + lines
            ),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation • Reaja abaixo para receber/remover um cargo"),
        )
    )

def v2_transfer_window() -> discord.ui.DesignerView:
    clubs_status = "🟢 **Aberta** — Clubes podem contratar jogadores" if transfer_window["clubs"] else "🔴 **Fechada** — Clubes não podem contratar jogadores"
    intl_status  = "🟢 **Aberta** — Seleções podem contratar jogadores" if transfer_window["internacional"] else "🔴 **Fechada** — Seleções não podem contratar jogadores"
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.TextDisplay(content="## 🪟 Janela de Transferências"),
            discord.ui.TextDisplay(content="Selecione qual janela deseja **abrir** ou **fechar**:"),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content=f"**🏟️ Clubs**\n{clubs_status}"),
            discord.ui.Separator(divider=False, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content=f"**🌍 Internacional**\n{intl_status}"),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation • Apenas Administradores"),
            discord.ui.ActionRow(
                discord.ui.Button(
                    label=f"Clubs — {'Fechar' if transfer_window['clubs'] else 'Abrir'}",
                    custom_id="window_toggle_clubs",
                    style=discord.ButtonStyle.green if not transfer_window["clubs"] else discord.ButtonStyle.red,
                    emoji="🏟️",
                ),
                discord.ui.Button(
                    label=f"Internacional — {'Fechar' if transfer_window['internacional'] else 'Abrir'}",
                    custom_id="window_toggle_internacional",
                    style=discord.ButtonStyle.green if not transfer_window["internacional"] else discord.ButtonStyle.red,
                    emoji="🌍",
                ),
            ),
        )
    )

def v2_contract_proposal(
    signee: discord.User,
    contractor: discord.User,
    team_name: str,
    position: str,
    role: str,
    contract_id: str,
    guild_icon_url: str | None,
) -> discord.ui.DesignerView:
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.Section(
                discord.ui.TextDisplay(content="## 📋 Agreement Contract"),
                discord.ui.TextDisplay(
                    content=(
                        "By signing this contract, you commit to representing the Contractor "
                        "and their team with dedication throughout the tournament, competing to "
                        "the best of your abilities and upholding team loyalty."
                    )
                ),
                accessory=discord.ui.Thumbnail(url=guild_icon_url or signee.display_avatar.url),
            ),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.Section(
                discord.ui.TextDisplay(content=f"**Signee:** {signee.mention} ({signee.name})"),
                discord.ui.TextDisplay(content=f"**Contractor:** {contractor.mention} ({contractor.name})"),
                accessory=discord.ui.Thumbnail(url=signee.display_avatar.url),
            ),
            discord.ui.Separator(divider=False, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content=f"**🏟️ Team:** {team_name}"),
            discord.ui.TextDisplay(content=f"**⚽ Position:** {position}"),
            discord.ui.TextDisplay(content=f"**🎭 Role:** {role}"),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation"),
            discord.ui.ActionRow(
                discord.ui.Button(
                    label="Accept",
                    custom_id=f"contract_accept_{contract_id}",
                    style=discord.ButtonStyle.green,
                ),
                discord.ui.Button(
                    label="Reject",
                    custom_id=f"contract_reject_{contract_id}",
                    style=discord.ButtonStyle.red,
                ),
            ),
        )
    )

def v2_contract_accepted(c: dict, signee: discord.User, contractor: discord.User) -> discord.ui.DesignerView:
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.Section(
                discord.ui.TextDisplay(content="## ✅ Contract Accepted"),
                discord.ui.TextDisplay(
                    content=f"{signee.mention} has successfully signed with **{c['team_name']}**"
                ),
                accessory=discord.ui.Thumbnail(url=signee.display_avatar.url),
            ),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content=f"**Signee:** {signee.mention} ({signee.name})"),
            discord.ui.TextDisplay(content=f"**Contractor:** {contractor.mention} ({contractor.name})"),
            discord.ui.TextDisplay(content=f"**🏟️ Team:** {c['team_name']}"),
            discord.ui.TextDisplay(content=f"**⚽ Position:** {c['position']}"),
            discord.ui.TextDisplay(content=f"**🎭 Role:** {c['role']}"),
            discord.ui.TextDisplay(content=f"**📅 Signed on:** {fmt_timestamp(c['signed_at'])}"),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation"),
            discord.ui.ActionRow(
                discord.ui.Button(label="Accept", style=discord.ButtonStyle.green, disabled=True, custom_id="disabled_accept"),
                discord.ui.Button(label="Reject",  style=discord.ButtonStyle.red,   disabled=True, custom_id="disabled_reject"),
            ),
        )
    )

def v2_contract_rejected(c: dict, signee: discord.User, contractor: discord.User) -> discord.ui.DesignerView:
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.Section(
                discord.ui.TextDisplay(content="## ❌ Contract Rejected"),
                discord.ui.TextDisplay(
                    content=f"{signee.mention} rejected the contract proposed by {contractor.mention} for team **{c['team_name']}**."
                ),
                accessory=discord.ui.Thumbnail(url=signee.display_avatar.url),
            ),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation"),
            discord.ui.ActionRow(
                discord.ui.Button(label="Accept", style=discord.ButtonStyle.green, disabled=True, custom_id="disabled_accept2"),
                discord.ui.Button(label="Reject",  style=discord.ButtonStyle.red,   disabled=True, custom_id="disabled_reject2"),
            ),
        )
    )

def v2_contract_expired(c: dict) -> discord.ui.DesignerView:
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.TextDisplay(content="## ⏰ Contrato Expirado"),
            discord.ui.TextDisplay(
                content=f"O contrato de **{c['signee_username']}** com **{c['team_name']}** expirou após 24 horas."
            ),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content=f"**Jogador:** <@{c['signee_id']}>"),
            discord.ui.TextDisplay(content=f"**Time:** {c['team_name']}"),
            discord.ui.TextDisplay(content=f"**Posição:** {c['position']}"),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation"),
        )
    )

def v2_fa_announcement(user: discord.User, posicao: str, plataforma: str, exp: str, sobre: str | None) -> discord.ui.DesignerView:
    extra = f"\n**💬 Sobre:** {sobre}" if sobre else ""
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.Section(
                discord.ui.TextDisplay(content="## 📢 Free Agent"),
                discord.ui.TextDisplay(content=f"{user.mention} está disponível para ser contratado!"),
                accessory=discord.ui.Thumbnail(url=user.display_avatar.url),
            ),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content=f"**⚽ Posição:** {posicao}"),
            discord.ui.TextDisplay(content=f"**🖥️ Plataforma:** {plataforma}"),
            discord.ui.TextDisplay(content=f"**📊 Experiência:** {exp}{extra}"),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation"),
        )
    )

def v2_scouting(user: discord.User, time_name: str, posicao: str, sobre: str) -> discord.ui.DesignerView:
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.Section(
                discord.ui.TextDisplay(content="## 🔍 Anúncio de Scouting"),
                discord.ui.TextDisplay(content=f"{user.mention} está procurando novos talentos!"),
                accessory=discord.ui.Thumbnail(url=user.display_avatar.url),
            ),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content=f"**🏟️ Time:** {time_name}"),
            discord.ui.TextDisplay(content=f"**⚽ Posição:** {posicao}"),
            discord.ui.TextDisplay(content=f"**📝 Detalhes:** {sobre}"),
            discord.ui.TextDisplay(content=f"**👤 Scout:** {user.mention}"),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation"),
        )
    )

def v2_friendly(user: discord.User, team_name: str, sobre: str) -> discord.ui.DesignerView:
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.Section(
                discord.ui.TextDisplay(content="## ⚽ Pedido de Friendly"),
                discord.ui.TextDisplay(content=f"{user.mention} está procurando um adversário para um friendly!"),
                accessory=discord.ui.Thumbnail(url=user.display_avatar.url),
            ),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content=f"**🏟️ Time:** {team_name}"),
            discord.ui.TextDisplay(content=f"**👤 Responsável:** {user.mention}"),
            discord.ui.TextDisplay(content=f"**📝 Sobre:** {sobre}"),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation"),
        )
    )

def v2_release(user: discord.User, role_name: str, still_in_team: bool) -> discord.ui.DesignerView:
    status = "Ainda em outro time/seleção" if still_in_team else "🟡 Free Agent"
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.Section(
                discord.ui.TextDisplay(content="## 🔓 Liberação Confirmada"),
                discord.ui.TextDisplay(content=f"{user.mention} não faz mais parte de **{role_name}**."),
                accessory=discord.ui.Thumbnail(url=user.display_avatar.url),
            ),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content=f"**Jogador:** {user.mention}"),
            discord.ui.TextDisplay(content=f"**Cargo Removido:** {role_name}"),
            discord.ui.TextDisplay(content=f"**Status:** {status}"),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation"),
        )
    )

def v2_release_choose(roles: list[dict]) -> discord.ui.DesignerView:
    """Card com select menu para escolher de qual time/seleção sair."""
    options = [
        discord.SelectOption(
            label=r["name"],
            value=str(r["id"]),
            description="Time Nacional" if r["type"] == "team" else "Seleção Internacional",
        )
        for r in roles
    ]
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.TextDisplay(content="## 🤔 De qual você quer sair?"),
            discord.ui.TextDisplay(
                content="Você possui cargos em um time nacional e em uma seleção internacional. Escolha abaixo de qual deseja se liberar."
            ),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation"),
            discord.ui.ActionRow(
                discord.ui.Select(
                    custom_id="release_select",
                    placeholder="Escolha de qual time/seleção você deseja sair...",
                    options=options,
                )
            ),
        )
    )

def v2_ticket_welcome(user_mention: str) -> discord.ui.DesignerView:
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.TextDisplay(content="## 🎫 Ticket Aberto"),
            discord.ui.TextDisplay(
                content=(
                    f"Olá {user_mention}! Seja bem-vindo ao suporte da **The Classic Soccer Federation**.\n\n"
                    "Escolha uma opção abaixo digitando:\n\n"
                    "👑 **Ownar** — Quero ownar um time\n"
                    "🤝 **Parceria** — Quero fazer parceria\n"
                    "🆘 **Suporte** — Preciso de ajuda\n\n"
                    "Ou explique diretamente seu problema que um staff irá te atender."
                )
            ),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation • Responderemos em breve!"),
        )
    )

def v2_ticket_auto_response(user_mention: str, title: str, description: str) -> discord.ui.DesignerView:
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.TextDisplay(content=f"## {title}"),
            discord.ui.TextDisplay(content=f"{user_mention}"),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content=description),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation"),
        )
    )

def v2_announce(author: discord.User, title: str | None, message: str) -> discord.ui.DesignerView:
    header = f"## {title}\n\n{message}" if title else message
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.Section(
                discord.ui.TextDisplay(content=header),
                discord.ui.TextDisplay(content=f"-# Enviado por {author.name} • The Classic Soccer Federation"),
                accessory=discord.ui.Thumbnail(url=author.display_avatar.url),
            ),
        )
    )

def v2_reaction_role_added(label: str) -> discord.ui.DesignerView:
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.TextDisplay(content="## ✅ Cargo Recebido!"),
            discord.ui.TextDisplay(
                content=f"Você recebeu o cargo **{label}** no servidor **The Classic Soccer Federation**!\n\nPara remover, é só tirar a reação."
            ),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation"),
        )
    )

def v2_reaction_role_removed(label: str) -> discord.ui.DesignerView:
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.TextDisplay(content="## 🗑️ Cargo Removido"),
            discord.ui.TextDisplay(
                content=f"O cargo **{label}** foi removido do servidor **The Classic Soccer Federation**.\n\nPara receber novamente, reaja à mensagem de cargos."
            ),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation"),
        )
    )

def v2_contract_dm(team_name: str, position: str, contractor_name: str) -> discord.ui.DesignerView:
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.TextDisplay(content="## 📋 Contract Recebido!"),
            discord.ui.TextDisplay(
                content="Você recebeu um **offer de contract** na liga **The Classic Soccer Federation**!"
            ),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content=f"**👕 Time:** {team_name}"),
            discord.ui.TextDisplay(content=f"**⚽ Posição:** {position}"),
            discord.ui.TextDisplay(content=f"**👤 Enviado por:** {contractor_name}"),
            discord.ui.Separator(divider=False, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(
                content="Confira os detalhes e aceite ou rejeite o contrato no canal:\n"
                        "🔗 [Ir para o Canal de Contratos](https://discord.com/channels/1491080801662533878/1491447652422914220)"
            ),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation • Responda o mais rápido possível!"),
        )
    )

def v2_active_contracts() -> discord.ui.DesignerView:
    if not active_contracts:
        return discord.ui.DesignerView(
            discord.ui.Container(
                discord.ui.TextDisplay(content="## 📭 Nenhum contrato ativo no momento."),
            )
        )
    items = []
    for c in active_contracts.values():
        items.append(discord.ui.TextDisplay(
            content=f"**{c['team_name']} — {c['signee_username']}**\n"
                    f"Posição: {c['position']} | Contratante: {c['contractor_username']} | "
                    f"Assinado: {fmt_timestamp(c['signed_at'])}"
        ))
        items.append(discord.ui.Separator(divider=False, spacing=discord.SeparatorSpacingSize.small))

    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.TextDisplay(content=f"## 📂 Contratos Ativos ({len(active_contracts)})"),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            *items,
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation"),
        )
    )

def v2_my_contract(c: dict) -> discord.ui.DesignerView:
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.TextDisplay(content="## ✅ Seu Contrato Ativo"),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content=f"**🏟️ Time:** {c['team_name']}"),
            discord.ui.TextDisplay(content=f"**⚽ Posição:** {c['position']}"),
            discord.ui.TextDisplay(content=f"**👤 Contratante:** <@{c['contractor_id']}>"),
            discord.ui.TextDisplay(content=f"**📅 Assinado em:** {fmt_timestamp(c['signed_at'])}"),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation"),
        )
    )

def v2_ping_reminder() -> discord.ui.DesignerView:
    lines = "\n".join(f"{r['emoji']} **{r['label']}** — {r['description']}" for r in REACTION_ROLES)
    return discord.ui.DesignerView(
        discord.ui.Container(
            discord.ui.TextDisplay(content="## 🔔 Lembrete de Cargos por Reação"),
            discord.ui.TextDisplay(
                content="Não se esqueça de reagir na mensagem de cargos para personalizar suas notificações!\n\n" + lines
            ),
            discord.ui.Separator(divider=True, spacing=discord.SeparatorSpacingSize.small),
            discord.ui.TextDisplay(content="-# The Classic Soccer Federation • Reaja na mensagem fixada acima!"),
        )
    )

# ══════════════════════════════════════════════════════════
# ⏱️  EXPIRAÇÃO DE CONTRATOS
# ══════════════════════════════════════════════════════════

async def expire_contract(contract_id: str):
    await asyncio.sleep(CONTRACT_EXPIRATION_SECONDS)
    c = active_contracts.pop(contract_id, None)
    if not c:
        return
    expiration_tasks.pop(contract_id, None)
    save_contracts()

    guild = bot.get_guild(c["guild_id"])
    if not guild:
        return

    member = guild.get_member(c["signee_id"])
    if member:
        team_role = guild.get_role(c["team_role_id"])
        if team_role:
            await member.roles.remove(team_role, reason="Contrato expirado").catch if False else None
            try:
                await member.remove_roles(team_role, reason="Contrato expirado")
            except Exception:
                pass
        try:
            fa_role = guild.get_role(FA_ROLE_ID)
            if fa_role:
                await member.add_roles(fa_role, reason="Contrato expirado — FA")
        except Exception:
            pass

    channel = guild.get_channel(CONTRACT_ANNOUNCEMENT_CHANNEL)
    if channel:
        view = v2_contract_expired(c)
        await channel.send(
            content=f"⚠️ <@{c['contractor_id']}> <@{c['signee_id']}>",
            view=view,
        )

async def schedule_contract_expiration(contract_id: str, remaining: float):
    task = bot.loop.create_task(_expire_after(contract_id, remaining))
    expiration_tasks[contract_id] = task

async def _expire_after(contract_id: str, seconds: float):
    await asyncio.sleep(seconds)
    c = active_contracts.pop(contract_id, None)
    if not c:
        return
    expiration_tasks.pop(contract_id, None)
    save_contracts()

    guild = bot.get_guild(c["guild_id"])
    if not guild:
        return

    member = guild.get_member(c["signee_id"])
    if member:
        team_role = guild.get_role(c["team_role_id"])
        if team_role:
            try:
                await member.remove_roles(team_role, reason="Contrato expirado")
            except Exception:
                pass
        try:
            fa_role = guild.get_role(FA_ROLE_ID)
            if fa_role:
                await member.add_roles(fa_role, reason="Contrato expirado — FA")
        except Exception:
            pass

    channel = guild.get_channel(CONTRACT_ANNOUNCEMENT_CHANNEL)
    if channel:
        view = v2_contract_expired(c)
        await channel.send(
            content=f"⚠️ <@{c['contractor_id']}> <@{c['signee_id']}>",
            view=view,
        )

# ══════════════════════════════════════════════════════════
# 📨  PING @here
# ══════════════════════════════════════════════════════════

async def send_here_ping(guild: discord.Guild):
    global last_ping_time
    channel = guild.get_channel(REACTION_ROLES_CHANNEL)
    if not channel:
        return
    msg = await channel.send(content="@here", view=v2_ping_reminder())
    last_ping_time = time.time()
    save_last_ping()
    await asyncio.sleep(60)
    try:
        await msg.delete()
    except Exception:
        pass

async def schedule_ping_loop(guild: discord.Guild):
    global last_ping_time
    last_ping_time = load_last_ping()
    now = time.time()
    if last_ping_time:
        elapsed = now - last_ping_time
        delay = max(0.0, PING_INTERVAL - elapsed)
    else:
        delay = PING_INTERVAL
    await asyncio.sleep(delay)
    while True:
        await send_here_ping(guild)
        await asyncio.sleep(PING_INTERVAL)

# ══════════════════════════════════════════════════════════
# 🎫  REACTION ROLES — SETUP
# ══════════════════════════════════════════════════════════

async def setup_reaction_roles(guild: discord.Guild):
    global reaction_message_id
    channel = guild.get_channel(REACTION_ROLES_CHANNEL)
    if not channel:
        return

    if reaction_message_id:
        try:
            existing = await channel.fetch_message(reaction_message_id)
            if existing:
                print(f"✅ Mensagem de reaction roles já existe: {reaction_message_id}")
                return
        except Exception:
            pass

    msg = await channel.send(view=v2_reaction_roles())
    for r in REACTION_ROLES:
        await msg.add_reaction(r["emoji"])
    reaction_message_id = msg.id
    save_reaction_message_id(msg.id)
    print(f"✅ Mensagem de reaction roles criada: {msg.id}")

# ══════════════════════════════════════════════════════════
# 🚀  ON READY
# ══════════════════════════════════════════════════════════

@bot.event
async def on_ready():
    global reaction_message_id
    print(f"✅ Bot online como: {bot.user}")

    load_transfer_window()
    reaction_message_id = load_reaction_message_id()
    _load_contracts()

    await bot.sync_commands()
    print("✅ Slash commands sincronizados!")

    guild = bot.guilds[0] if bot.guilds else None
    if guild:
        bot.loop.create_task(schedule_ping_loop(guild))

    await bot.change_presence(
        activity=discord.Game(name="The Classic Soccer Federation"),
        status=discord.Status.online,
    )

def _load_contracts():
    data = load_json(CONTRACTS_FILE, {})
    now = time.time()
    loaded = 0
    for cid, c in data.items():
        expires_at = c.get("expires_at", 0)
        remaining = expires_at - now
        if remaining > 0:
            active_contracts[cid] = c
            bot.loop.create_task(schedule_contract_expiration(cid, remaining))
            loaded += 1
    print(f"✅ {loaded} contrato(s) carregado(s).")

# ══════════════════════════════════════════════════════════
# 📩  ON CHANNEL CREATE — TICKET
# ══════════════════════════════════════════════════════════

@bot.event
async def on_guild_channel_create(channel):
    if not isinstance(channel, discord.TextChannel):
        return
    if not channel.name.lower().startswith("ticket"):
        return

    await asyncio.sleep(1.5)
    ticket_owner = None
    for overwrite_id, overwrite in channel.overwrites.items():
        if isinstance(overwrite_id, discord.Member) and not overwrite_id.bot:
            if overwrite.send_messages:
                ticket_owner = overwrite_id
                break

    mention = ticket_owner.mention if ticket_owner else "usuário"
    try:
        await channel.send(view=v2_ticket_welcome(mention))
    except Exception as e:
        print(f"❌ Erro ao enviar boas-vindas no ticket: {e}")

# ══════════════════════════════════════════════════════════
# 😀  REACTION ROLES — ADD / REMOVE
# ══════════════════════════════════════════════════════════

@bot.event
async def on_reaction_add(reaction, user):
    if user.bot:
        return
    if reaction.message.id != reaction_message_id:
        return
    role_cfg = next((r for r in REACTION_ROLES if r["emoji"] == str(reaction.emoji)), None)
    if not role_cfg:
        return
    guild = reaction.message.guild
    member = guild.get_member(user.id)
    if not member:
        return
    role = guild.get_role(role_cfg["role_id"])
    if role:
        try:
            await member.add_roles(role)
        except Exception:
            pass
    try:
        await user.send(view=v2_reaction_role_added(role_cfg["label"]))
    except Exception:
        pass

@bot.event
async def on_reaction_remove(reaction, user):
    if user.bot:
        return
    if reaction.message.id != reaction_message_id:
        return
    role_cfg = next((r for r in REACTION_ROLES if r["emoji"] == str(reaction.emoji)), None)
    if not role_cfg:
        return
    guild = reaction.message.guild
    member = guild.get_member(user.id)
    if not member:
        return
    role = guild.get_role(role_cfg["role_id"])
    if role:
        try:
            await member.remove_roles(role)
        except Exception:
            pass
    try:
        await user.send(view=v2_reaction_role_removed(role_cfg["label"]))
    except Exception:
        pass

# ══════════════════════════════════════════════════════════
# 💬  ON MESSAGE
# ══════════════════════════════════════════════════════════

@bot.event
async def on_message(message: discord.Message):
    if message.author.bot or not message.guild:
        return

    msg_lower = message.content.lower().strip()
    channel_name = (message.channel.name or "").lower()
    is_ticket = channel_name.startswith("ticket")

    # ── Filtro de convites ──────────────────────────────
    if (
        not is_ticket
        and isinstance(message.author, discord.Member)
        and not message.author.guild_permissions.manage_messages
        and INVITE_REGEX.search(message.content)
    ):
        try:
            await message.delete()
            warn = await message.channel.send(
                f"🚫 {message.author.mention}, **convites de outros servidores não são permitidos aqui!**"
            )
            await asyncio.sleep(5)
            await warn.delete()
        except Exception:
            pass
        return

    # ── Filtro de divulgação ────────────────────────────
    if DIVULGACAO_REGEX.match(msg_lower):
        has_perm = any(r.id in ALLOWED_COMMAND_ROLES for r in message.author.roles)
        if not has_perm:
            try:
                await message.delete()
                warn = await message.channel.send(
                    f"🚫 {message.author.mention}, **divulgações não são permitidas aqui!**"
                )
                await asyncio.sleep(5)
                await warn.delete()
            except Exception:
                pass
            return

    # ── Filtro de link Roblox ───────────────────────────
    if ROBLOX_PRIVATE_SERVER_REGEX.search(message.content):
        if message.channel.id not in ALLOWED_ROBLOX_LINK_CHANNELS:
            try:
                await message.delete()
                warn = await message.channel.send(
                    f"🚫 {message.author.mention}, **links de servidores privados do Roblox não são permitidos aqui!**"
                )
                await asyncio.sleep(5)
                await warn.delete()
            except Exception:
                pass
            return

    # ── Help automático ─────────────────────────────────
    if message.channel.id == HELP_AUTO_CHANNEL:
        triggers = ["help", "ajuda", "comandos", "como usar", "quais comandos"]
        if any(t in msg_lower for t in triggers):
            try:
                await message.delete()
            except Exception:
                pass
            msg = await message.channel.send(
                content=message.author.mention,
                view=v2_help(),
            )
            await asyncio.sleep(30)
            try:
                await msg.delete()
            except Exception:
                pass
            return

    # ── Auto-respostas em tickets ───────────────────────
    if is_ticket:
        for entry in TICKET_AUTO_RESPONSES:
            if any(k in msg_lower for k in entry["keywords"]):
                try:
                    sent = await message.channel.send(
                        content=message.author.mention,
                        view=v2_ticket_auto_response(
                            message.author.mention,
                            entry["title"],
                            entry["description"],
                        ),
                    )
                    await asyncio.sleep(60)
                    try:
                        await sent.delete()
                    except Exception:
                        pass
                except Exception as e:
                    print(f"❌ Erro no auto ticket: {e}")
                break
        return  # Não processa outras respostas dentro de tickets

    # ── Auto-respostas gerais ───────────────────────────
    for entry in AUTO_RESPONSES:
        if any(k in msg_lower for k in entry["keywords"]):
            try:
                await message.reply(content=entry["response"])
            except Exception:
                pass
            return

    await bot.process_commands(message)

# ══════════════════════════════════════════════════════════
# 🎮  SLASH COMMANDS
# ══════════════════════════════════════════════════════════

@bot.slash_command(name="help", description="Ver todos os comandos disponíveis")
async def cmd_help(ctx: discord.ApplicationContext):
    await ctx.respond(view=v2_help(), ephemeral=True)


@bot.slash_command(name="setup_reaction_roles", description="(Admin) Envia a mensagem de cargos por reação")
@discord.default_permissions(administrator=True)
async def cmd_setup_reaction_roles(ctx: discord.ApplicationContext):
    await ctx.defer(ephemeral=True)
    try:
        await setup_reaction_roles(ctx.guild)
        await ctx.followup.send(content="✅ Mensagem de reaction roles enviada com sucesso!", ephemeral=True)
    except Exception as e:
        await ctx.followup.send(content=f"❌ Erro: {e}", ephemeral=True)


@bot.slash_command(name="janela", description="(Admin) Abre ou fecha a janela de transferências")
@discord.default_permissions(administrator=True)
async def cmd_janela(ctx: discord.ApplicationContext):
    if not ctx.author.guild_permissions.administrator:
        await ctx.respond(view=v2_error("🔒 Acesso Negado", "Apenas **administradores** podem usar este comando."), ephemeral=True)
        return
    await ctx.respond(view=v2_transfer_window(), ephemeral=True)


@bot.slash_command(name="contratos_ativos", description="Ver todos os contratos ativos")
async def cmd_contratos_ativos(ctx: discord.ApplicationContext):
    if not has_command_permission(ctx.author):
        await ctx.respond(view=v2_error("🔒 Sem Permissão", "Você não tem permissão para usar este comando."), ephemeral=True)
        return
    await ctx.respond(view=v2_active_contracts(), ephemeral=True)


@bot.slash_command(name="meu_contrato", description="Ver seu contrato atual")
async def cmd_meu_contrato(ctx: discord.ApplicationContext):
    if not has_command_permission(ctx.author):
        await ctx.respond(view=v2_error("🔒 Sem Permissão", "Você não tem permissão para usar este comando."), ephemeral=True)
        return
    c = next((v for v in active_contracts.values() if v["signee_id"] == ctx.author.id), None)
    if not c:
        await ctx.respond(content="📭 Você não possui contrato ativo.", ephemeral=True)
        return
    await ctx.respond(view=v2_my_contract(c), ephemeral=True)


@bot.slash_command(name="contract", description="Propor um contrato para um jogador")
@option("jogador", discord.Member, description="O jogador que vai assinar", required=True)
@option("time", discord.Role, description="Cargo do time", required=True)
@option("posicao", str, description="Posição do jogador (ex: cb, st, gk)", required=True)
@option("role", str, description="Role do jogador (ex: Titular, Subs)", required=True)
async def cmd_contract(
    ctx: discord.ApplicationContext,
    jogador: discord.Member,
    time: discord.Role,
    posicao: str,
    role: str,
):
    if ctx.channel.id not in ALLOWED_CONTRACT_CHANNELS:
        await ctx.respond(view=v2_error("❌ Canal Não Permitido", "Este comando só pode ser utilizado em canais específicos."), ephemeral=True)
        return
    if not has_command_permission(ctx.author):
        await ctx.respond(view=v2_error("🔒 Sem Permissão", "Você não tem permissão para usar este comando."), ephemeral=True)
        return

    # Verifica contrato existente
    existing = next((c for c in active_contracts.values() if c["signee_id"] == jogador.id), None)
    if existing:
        await ctx.respond(view=v2_error("❌ Contrato Já Existente", f"{jogador.mention} já possui um contrato ativo com **{existing['team_name']}**."), ephemeral=True)
        return

    is_team_contract = time.id in ALLOWED_TEAM_ROLES
    is_intl_contract = time.id in INTERNATIONAL_ROLES

    # Verificação de janela
    if is_team_contract and not transfer_window["clubs"]:
        await ctx.respond(view=v2_error("🚫 Janela de Clubs Fechada", "A janela de transferências para **clubes** está fechada no momento.\nApenas **seleções internacionais** podem contratar jogadores."), ephemeral=True)
        return

    if is_intl_contract:
        if not transfer_window["internacional"]:
            await ctx.respond(view=v2_error("🚫 Janela Internacional Fechada", "A janela de transferências para **seleções internacionais** está fechada no momento."), ephemeral=True)
            return
        # Verifica se jogador já está em seleção
        has_intl = any(r.id in INTERNATIONAL_ROLES for r in jogador.roles)
        if has_intl:
            current_intl = next((r for r in jogador.roles if r.id in INTERNATIONAL_ROLES), None)
            await ctx.respond(
                view=v2_error(
                    "⛔ Jogador Já em uma Seleção",
                    f"{jogador.mention} já faz parte de **{current_intl.name if current_intl else 'uma seleção'}** e não pode receber outro contrato internacional."
                ),
                ephemeral=True,
            )
            return

    if not is_role_allowed(time):
        await ctx.respond(view=v2_error("❌ Cargo Não Permitido", f"O cargo **{time.name}** não está autorizado para contratos."), ephemeral=True)
        return

    dangerous_perms = discord.Permissions(administrator=True) | discord.Permissions(manage_guild=True) | discord.Permissions(manage_roles=True)
    if time.permissions.value & dangerous_perms.value:
        await ctx.respond(view=v2_error("🔒 Cargo Administrativo Bloqueado", "Por segurança, cargos com permissões administrativas não podem ser usados em contratos."), ephemeral=True)
        return

    contract_id = generate_contract_id()
    pending_contracts[contract_id] = {
        "contract_id": contract_id,
        "signee_id": jogador.id,
        "signee_username": jogador.name,
        "contractor_id": ctx.author.id,
        "contractor_username": ctx.author.name,
        "team_name": time.name,
        "team_role_id": time.id,
        "position": posicao,
        "role": role,
        "proposed_at": time.module if False else time.time() if False else __import__("time").time(),
        "guild_id": ctx.guild.id,
    }
    # Corrige o proposed_at
    pending_contracts[contract_id]["proposed_at"] = __import__("time").time()

    # Envia no canal de contratos
    ann_channel = ctx.guild.get_channel(CONTRACT_ANNOUNCEMENT_CHANNEL)
    if ann_channel:
        await ann_channel.send(
            content=f"🔔 {jogador.mention}, um contrato foi proposto por {ctx.author.mention}.",
            view=v2_contract_proposal(
                signee=jogador,
                contractor=ctx.author,
                team_name=time.name,
                position=posicao,
                role=role,
                contract_id=contract_id,
                guild_icon_url=ctx.guild.icon.url if ctx.guild.icon else None,
            ),
        )

    await ctx.respond(content="✅ Contrato enviado para o canal de contratos!", ephemeral=True)

    # DM ao jogador
    try:
        await jogador.send(view=v2_contract_dm(time.name, posicao, ctx.author.name))
    except Exception:
        pass


@bot.slash_command(name="fa", description="Anunciar que você está Free Agent")
@option("posicao", str, description="Sua posição (ex: cb, st, gk)", required=True)
@option("exp", str, description="Sua experiência", required=True)
@option("plataforma", str, description="Sua plataforma (ex: PC, Mobile, Console)", required=True)
@option("sobre", str, description="Algo sobre você (opcional)", required=False)
async def cmd_fa(ctx: discord.ApplicationContext, posicao: str, exp: str, plataforma: str, sobre: str = None):
    if ctx.channel.id not in ALLOWED_FA_CHANNELS:
        await ctx.respond(view=v2_error("❌ Canal Não Permitido", "Este comando só pode ser utilizado em canais específicos."), ephemeral=True)
        return
    has_team = any(r.id in ALLOWED_TEAM_ROLES for r in ctx.author.roles)
    if has_team:
        await ctx.respond(content=f"❌ Você já é de um time! Se quiser sair, use **/release** no canal <#1492354496259428392>.", ephemeral=True)
        return

    await ctx.respond(content="✅ Seu anúncio de Free Agent foi publicado!", ephemeral=True)
    ann_channel = ctx.guild.get_channel(FA_ANNOUNCEMENT_CHANNEL)
    if ann_channel:
        await ann_channel.send(view=v2_fa_announcement(ctx.author, posicao, plataforma, exp, sobre))


@bot.slash_command(name="scouting", description="Anunciar um scout de jogador")
@discord.default_permissions(manage_guild=True)
@option("time", str, description="Nome do time que deseja recrutar", required=True)
@option("posicao", str, description="Posição do jogador procurado", required=True)
@option("sobre", str, description="Descrição do scout (requisitos, etc)", required=True)
async def cmd_scouting(ctx: discord.ApplicationContext, time: str, posicao: str, sobre: str):
    if ctx.channel.id not in ALLOWED_SCOUTING_CHANNELS:
        await ctx.respond(view=v2_error("❌ Canal Não Permitido", "Este comando só pode ser utilizado em canais específicos."), ephemeral=True)
        return
    if not has_command_permission(ctx.author):
        await ctx.respond(view=v2_error("🔒 Sem Permissão", "Você não tem permissão para usar este comando."), ephemeral=True)
        return

    await ctx.respond(content="✅ Seu anúncio de scouting foi publicado!", ephemeral=True)
    ann_channel = ctx.guild.get_channel(SCOUTING_ANNOUNCEMENT_CHANNEL)
    if ann_channel:
        await ann_channel.send(view=v2_scouting(ctx.author, time, posicao, sobre))


@bot.slash_command(name="friendly", description="Anunciar um pedido de friendly")
@option("sobre", str, description="Detalhes do friendly (horário, formato, etc)", required=True)
async def cmd_friendly(ctx: discord.ApplicationContext, sobre: str):
    if ctx.channel.id not in ALLOWED_FRIENDLY_CHANNELS:
        await ctx.respond(view=v2_error("❌ Canal Não Permitido", "Este comando só pode ser utilizado em canais específicos."), ephemeral=True)
        return
    if not has_command_permission(ctx.author):
        await ctx.respond(view=v2_error("🔒 Sem Permissão", "Você não tem permissão para usar este comando."), ephemeral=True)
        return

    team_role = next((ctx.guild.get_role(rid) for rid in ALLOWED_TEAM_ROLES if any(r.id == rid for r in ctx.author.roles)), None)
    team_name = team_role.name if team_role else "Time não identificado"

    await ctx.respond(content="✅ Seu pedido de friendly foi publicado!", ephemeral=True)
    ann_channel = ctx.guild.get_channel(FRIENDLY_ANNOUNCEMENT_CHANNEL)
    if ann_channel:
        await ann_channel.send(view=v2_friendly(ctx.author, team_name, sobre))


@bot.slash_command(name="release", description="Se liberar de um time e voltar a ser Free Agent")
async def cmd_release(ctx: discord.ApplicationContext):
    if ctx.channel.id not in ALLOWED_RELEASE_CHANNELS:
        await ctx.respond(view=v2_error("❌ Canal Não Permitido", "Este comando só pode ser utilizado em canais específicos."), ephemeral=True)
        return

    member = ctx.author
    team_roles = [
        {"id": r.id, "name": r.name, "type": "team"}
        for r in member.roles if r.id in ALLOWED_TEAM_ROLES
    ]
    intl_roles = [
        {"id": r.id, "name": r.name, "type": "international"}
        for r in member.roles if r.id in INTERNATIONAL_ROLES
    ]
    all_roles = team_roles + intl_roles

    if not all_roles:
        await ctx.respond(view=v2_error("❌ Sem Time/Seleção", "Você não possui nenhum cargo de time ou seleção para se liberar."), ephemeral=True)
        return

    if len(all_roles) == 1:
        r = all_roles[0]
        role_obj = ctx.guild.get_role(r["id"])
        await _do_release(ctx, member, role_obj, ctx.channel)
        return

    await ctx.respond(view=v2_release_choose(all_roles), ephemeral=True)


async def _do_release(ctx_or_interaction, member: discord.Member, role_obj: discord.Role, channel):
    """Executa o release efetivamente."""
    try:
        await member.remove_roles(role_obj, reason="Release voluntário")
    except Exception as e:
        print(f"❌ Erro ao remover cargo: {e}")

    # Remove contrato ativo se houver
    cid_to_remove = next((cid for cid, c in active_contracts.items() if c["signee_id"] == member.id), None)
    if cid_to_remove:
        active_contracts.pop(cid_to_remove, None)
        task = expiration_tasks.pop(cid_to_remove, None)
        if task:
            task.cancel()
        save_contracts()

    still_in_team = any(r.id in ALLOWED_TEAM_ROLES or r.id in INTERNATIONAL_ROLES for r in member.roles if r.id != role_obj.id)
    if not still_in_team:
        fa_role = member.guild.get_role(FA_ROLE_ID)
        if fa_role:
            try:
                await member.add_roles(fa_role, reason="FA após release")
            except Exception:
                pass

    view = v2_release(member, role_obj.name, still_in_team)
    await channel.send(
        content=f"{member.mention} não faz mais parte de **{role_obj.name}**.",
        view=view,
    )

    if isinstance(ctx_or_interaction, discord.ApplicationContext):
        await ctx_or_interaction.respond(content=f"✅ Você saiu de **{role_obj.name}** com sucesso!", ephemeral=True)
    else:
        await ctx_or_interaction.edit(content=f"✅ Você saiu de **{role_obj.name}** com sucesso!", view=None)


@bot.slash_command(name="announce", description="Faz um anúncio em formato embed em um canal específico")
@option("canal", discord.TextChannel, description="Canal onde o anúncio será enviado", required=True)
@option("mensagem", str, description="Mensagem do anúncio", required=True)
@option("titulo", str, description="Título do anúncio (opcional)", required=False)
async def cmd_announce(ctx: discord.ApplicationContext, canal: discord.TextChannel, mensagem: str, titulo: str = None):
    has_perm = any(r.id in ALLOWED_ANNOUNCE_ROLES for r in ctx.author.roles)
    if not has_perm:
        await ctx.respond(content="❌ Você não tem permissão para usar este comando.", ephemeral=True)
        return

    mensagem = mensagem.replace("\\n", "\n")
    try:
        await canal.send(view=v2_announce(ctx.author, titulo, mensagem))
        await ctx.respond(content=f"✅ Anúncio enviado com sucesso em {canal.mention}!", ephemeral=True)
    except Exception as e:
        await ctx.respond(content=f"❌ Não foi possível enviar o anúncio: {e}", ephemeral=True)

# ══════════════════════════════════════════════════════════
# 🖱️  INTERACTIONS (Buttons & Selects)
# ══════════════════════════════════════════════════════════

@bot.event
async def on_interaction(interaction: discord.Interaction):
    if interaction.type != discord.InteractionType.component:
        return

    custom_id: str = interaction.data.get("custom_id", "")

    # ── Janela de transferências ────────────────────────
    if custom_id in ("window_toggle_clubs", "window_toggle_internacional"):
        if not interaction.user.guild_permissions.administrator:
            await interaction.response.send_message(
                view=v2_error("🔒 Acesso Negado", "Apenas **administradores** podem usar este botão."),
                ephemeral=True,
            )
            return

        key = "clubs" if custom_id == "window_toggle_clubs" else "internacional"
        transfer_window[key] = not transfer_window[key]
        save_transfer_window()

        label = "🏟️ Clubs" if key == "clubs" else "🌍 Internacional"
        state = "🟢 **Aberta**" if transfer_window[key] else "🔴 **Fechada**"

        await interaction.response.edit_message(view=v2_transfer_window())
        await interaction.followup.send(
            view=v2_success("🪟 Janela Atualizada", f"A janela **{label}** foi alterada para {state}."),
            ephemeral=True,
        )
        return

    # ── Aceitar contrato ────────────────────────────────
    if custom_id.startswith("contract_accept_"):
        contract_id = custom_id.removeprefix("contract_accept_")
        c = pending_contracts.get(contract_id)
        if not c:
            await interaction.response.send_message(content="❌ Contrato não encontrado ou já processado.", ephemeral=True)
            return
        if interaction.user.id != c["signee_id"]:
            await interaction.response.send_message(content="❌ Apenas o jogador indicado pode aceitar este contrato.", ephemeral=True)
            return

        now = __import__("time").time()
        c["signed_at"] = now
        c["expires_at"] = now + CONTRACT_EXPIRATION_SECONDS
        active_contracts[contract_id] = c
        pending_contracts.pop(contract_id, None)
        save_contracts()

        task = bot.loop.create_task(_expire_after(contract_id, CONTRACT_EXPIRATION_SECONDS))
        expiration_tasks[contract_id] = task

        guild = interaction.guild
        member = guild.get_member(c["signee_id"])
        if member:
            team_role = guild.get_role(c["team_role_id"])
            if team_role:
                try:
                    await member.add_roles(team_role, reason="Contrato aceito")
                except Exception:
                    pass
            fa_role = guild.get_role(FA_ROLE_ID)
            if fa_role and any(r.id == FA_ROLE_ID for r in member.roles):
                try:
                    await member.remove_roles(fa_role, reason="Contrato aceito — não é mais FA")
                except Exception:
                    pass

        signee = await bot.fetch_user(c["signee_id"])
        contractor = await bot.fetch_user(c["contractor_id"])

        await interaction.response.edit_message(
            content=f"✅ {signee.mention} accepted the contract!",
            view=v2_contract_accepted(c, signee, contractor),
        )
        return

    # ── Rejeitar contrato ───────────────────────────────
    if custom_id.startswith("contract_reject_"):
        contract_id = custom_id.removeprefix("contract_reject_")
        c = pending_contracts.get(contract_id)
        if not c:
            await interaction.response.send_message(content="❌ Contrato não encontrado ou já processado.", ephemeral=True)
            return
        if interaction.user.id != c["signee_id"]:
            await interaction.response.send_message(content="❌ Apenas o jogador indicado pode rejeitar este contrato.", ephemeral=True)
            return

        pending_contracts.pop(contract_id, None)

        signee = await bot.fetch_user(c["signee_id"])
        contractor = await bot.fetch_user(c["contractor_id"])

        await interaction.response.edit_message(
            content=f"❌ {signee.mention} rejected the contract.",
            view=v2_contract_rejected(c, signee, contractor),
        )
        return

    # ── Select de release ───────────────────────────────
    if custom_id == "release_select":
        selected_role_id = int(interaction.data["values"][0])
        role_obj = interaction.guild.get_role(selected_role_id)
        if not role_obj:
            await interaction.response.send_message(content="❌ Cargo não encontrado.", ephemeral=True)
            return

        await interaction.response.defer()
        await _do_release(interaction, interaction.user, role_obj, interaction.channel)
        return

# ══════════════════════════════════════════════════════════
# 🏁  INICIAR
# ══════════════════════════════════════════════════════════

if __name__ == "__main__":
    bot.run(TOKEN)