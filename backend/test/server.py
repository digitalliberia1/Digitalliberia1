from fastapi import FastAPI, APIRouter, HTTPException
from contextlib import asynccontextmanager

try:
    from dotenv import load_dotenv # pyright: ignore[reportMissingImports]
except ImportError:
    load_dotenv = None

from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import asyncio
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone

try:
    import resend
except ImportError:
    resend = None


ROOT_DIR = Path(__file__).parent

if load_dotenv is None:
    def load_dotenv(dotenv_path=None, override=False):
        if dotenv_path is None:
            return False

        dotenv_path = Path(dotenv_path)

        if not dotenv_path.exists():
            return False

        with dotenv_path.open(encoding="utf-8") as env_file:
            for line in env_file:
                line = line.strip()

                if not line or line.startswith("#") or "=" not in line:
                    continue

                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")

                if override or key not in os.environ:
                    os.environ[key] = value

        return True


load_dotenv(ROOT_DIR / ".env")


# ============================================================
# CONFIG
# ============================================================

mongo_url = os.environ.get("MONGO_URL")
if not mongo_url:
    raise RuntimeError("MONGO_URL is not set")

db_name = os.environ.get("DB_NAME")
if not db_name:
    raise RuntimeError("DB_NAME is not set")

client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "")
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
CONTACT_RECIPIENT = os.environ.get("CONTACT_RECIPIENT", "doeblah004@gmail.com")

if resend is not None:
    resend.api_key = RESEND_API_KEY

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

cors_origins_raw = os.environ.get("CORS_ORIGINS", "*")
allow_origins = (
    ["*"]
    if cors_origins_raw == "*"
    else [origin.strip() for origin in cors_origins_raw.split(",") if origin.strip()]
)
allow_credentials = os.environ.get("CORS_ALLOW_CREDENTIALS", "true").lower() in {"1", "true", "yes"}
if allow_origins == ["*"] and allow_credentials:
    logger.warning(
        "CORS allow_credentials=True is incompatible with wildcard origins ('*'); "
        "disabling credentials support for CORS."
    )
    allow_credentials = False


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    client.close()

app = FastAPI(title="Digital Liberia API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

api_router = APIRouter(prefix="/api")


# ============================================================
# MODELS
# ============================================================

def now_iso():
    return datetime.now(timezone.utc).isoformat()


class ContactCreate(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    organization: Optional[str] = Field(None, max_length=160)
    sector: Optional[str] = Field(None, max_length=80)
    message: str = Field(..., min_length=10, max_length=4000)


class ContactRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    email: EmailStr
    organization: Optional[str] = None
    sector: Optional[str] = None
    message: str
    created_at: str = Field(default_factory=now_iso)
    email_sent: bool = False


class NewsletterCreate(BaseModel):
    email: EmailStr


class NewsletterRecord(BaseModel):
    model_config = ConfigDict(extra="ignore")

    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    created_at: str = Field(default_factory=now_iso)


class Initiative(BaseModel):
    id: str
    title: str
    sector: str
    status: str
    region: str
    summary: str
    pillar_slug: str


class ServiceSummary(BaseModel):
    slug: str
    title: str
    tagline: str
    sector: str
    icon: str


class ServiceDetail(BaseModel):
    slug: str
    title: str
    tagline: str
    sector: str
    icon: str
    overview: str
    objectives: List[str]
    programmes: List[dict]
    metrics: List[dict]
    partners: List[str]


# ============================================================
# STATIC CONTENT
# ============================================================

SERVICES: List[dict] = [
    {
        "slug": "digital-economy",
        "title": "Digital Economy",
        "tagline": "Catalyzing inclusive growth through digital trade and data-driven public investment.",
        "sector": "Economy",
        "icon": "trending-up",
        "overview": (
            "The Digital Economy pillar establishes the policy, infrastructure and "
            "interoperability standards required to move Liberia from a cash-and-paper "
            "economy to a transparent, data-driven marketplace of opportunity. We focus on "
            "broadband expansion, digital trade frameworks, and a national data exchange."
        ),
        "objectives": [
            "Expand affordable broadband to all 15 counties by 2028",
            "Establish a National Digital Trade framework aligned with AfCFTA",
            "Create open data portals for ministries and public agencies",
            "Promote local hosting, sovereign cloud and digital industrial parks",
        ],
        "programmes": [
            {
                "name": "Broadband for Counties",
                "status": "active",
                "summary": "Last-mile fiber & 4G/5G expansion to under-served districts.",
            },
            {
                "name": "Open Data Liberia",
                "status": "piloting",
                "summary": "Public datasets for budget, health, education, agriculture.",
            },
            {
                "name": "AfCFTA Digital Trade",
                "status": "planning",
                "summary": "Digitizing customs, e-invoicing and cross-border payments.",
            },
        ],
        "metrics": [
            {"label": "Broadband coverage target", "value": "95%"},
            {"label": "Open datasets by 2027", "value": "200+"},
            {"label": "Digital GDP contribution", "value": "12%"},
        ],
        "partners": ["Ministry of Commerce", "LTA", "World Bank", "ITU", "ECOWAS"],
    },
    {
        "slug": "digital-markets",
        "title": "Digital Markets",
        "tagline": "Modernizing local trade with mobile payments and traceable supply chains.",
        "sector": "Markets",
        "icon": "store",
        "overview": (
            "From the Waterside Market to rural cocoa cooperatives, the Digital Markets "
            "programme equips traders, farmers and SMEs with the tools to sell, trace and "
            "get paid digitally — unlocking dignity, credit and access to global buyers."
        ),
        "objectives": [
            "Onboard 250,000 micro-merchants to mobile payments",
            "Build a national agricultural traceability system",
            "Launch a Liberian e-commerce gateway for diaspora trade",
            "Subsidize digital point-of-sale devices for small vendors",
        ],
        "programmes": [
            {
                "name": "Tap & Trade",
                "status": "active",
                "summary": "QR-code mobile payments for market vendors.",
            },
            {
                "name": "FarmTrace",
                "status": "piloting",
                "summary": "Cocoa & rubber traceability from farm to port.",
            },
            {
                "name": "Liberia Marketplace",
                "status": "planning",
                "summary": "National e-commerce hub for diaspora & exports.",
            },
        ],
        "metrics": [
            {"label": "Merchants onboarded", "value": "62,000"},
            {"label": "Markets digitized", "value": "48"},
            {"label": "Diaspora buyers reached", "value": "8 countries"},
        ],
        "partners": [
            "Ministry of Agriculture",
            "Central Bank of Liberia",
            "MTN",
            "Orange",
            "USAID",
        ],
    },
    {
        "slug": "business-sme",
        "title": "Business & SME Tech",
        "tagline": "Empowering Liberian entrepreneurs with cloud tools and digital tax services.",
        "sector": "Business",
        "icon": "briefcase",
        "overview": (
            "Small and medium enterprises generate over 70% of Liberian employment. The "
            "Business & SME Tech pillar removes friction from starting, registering, paying "
            "tax, hiring and exporting — all online, all in one citizen portal."
        ),
        "objectives": [
            "One-day online business registration nationwide",
            "Free digital tools (accounting, invoicing, HR) for registered SMEs",
            "Unified digital tax portal with mobile filing",
            "Liberia Startup Visa & Founder support programme",
        ],
        "programmes": [
            {
                "name": "Register-in-a-Day",
                "status": "active",
                "summary": "End-to-end online business registration.",
            },
            {
                "name": "SME Cloud Toolkit",
                "status": "piloting",
                "summary": "Free Liberian-hosted accounting + invoicing suite.",
            },
            {
                "name": "Tax 2.0",
                "status": "planning",
                "summary": "Mobile-first tax filing & payment portal.",
            },
        ],
        "metrics": [
            {"label": "SMEs onboarded", "value": "11,400"},
            {"label": "Avg. registration time", "value": "26 hrs"},
            {"label": "Tax filings online", "value": "38%"},
        ],
        "partners": ["LRA", "LBR", "Ministry of Commerce", "AfDB", "Smart Africa"],
    },
    {
        "slug": "banking-fintech",
        "title": "Banking & FinTech",
        "tagline": "Inclusive financial systems and interoperable mobile money for every citizen.",
        "sector": "Finance",
        "icon": "landmark",
        "overview": (
            "Banking & FinTech delivers an interoperable national payment switch, regulatory "
            "sandbox for fintech innovation, and rural banking via agent networks — so that "
            "every Liberian, in every county, can save, send and grow money safely."
        ),
        "objectives": [
            "National Instant Payment Switch (interoperable across banks & mobile money)",
            "FinTech regulatory sandbox under the Central Bank of Liberia",
            "Agent banking in all 90+ districts",
            "Digital Liberian Dollar pilot (CBDC research)",
        ],
        "programmes": [
            {
                "name": "LiberiaPay Switch",
                "status": "active",
                "summary": "Real-time interoperable payments across all FSPs.",
            },
            {
                "name": "FinTech Sandbox",
                "status": "piloting",
                "summary": "Regulated testbed for licensed innovators.",
            },
            {
                "name": "Rural Agent Network",
                "status": "active",
                "summary": "Cash-in/cash-out points in every district.",
            },
        ],
        "metrics": [
            {"label": "Banked + mobile money adults", "value": "58%"},
            {"label": "Agent banking points", "value": "4,200"},
            {"label": "Daily switch transactions", "value": "180k"},
        ],
        "partners": [
            "Central Bank of Liberia",
            "GIABA",
            "AFI",
            "IFC",
            "Local Banks Consortium",
        ],
    },
    {
        "slug": "national-digital-id",
        "title": "National Digital ID",
        "tagline": "A trusted, citizen-first identity for every Liberian — secure by design.",
        "sector": "Identity",
        "icon": "id-card",
        "overview": (
            "The National Digital ID is the foundation of a modern republic. Every citizen "
            "and resident receives a unique, privacy-preserving digital identity — usable for "
            "voting, healthcare, banking, education, social protection and travel — with "
            "consent and revocation built in."
        ),
        "objectives": [
            "Universal enrollment of all citizens and legal residents",
            "Privacy-by-design architecture with citizen-controlled consent",
            "Federated authentication across government and private services",
            "Offline-first ID for areas with limited connectivity",
        ],
        "programmes": [
            {
                "name": "LIB-ID Enrollment",
                "status": "active",
                "summary": "Mobile enrollment teams reaching every county.",
            },
            {
                "name": "Consent Wallet",
                "status": "piloting",
                "summary": "Citizen-side app to manage data sharing.",
            },
            {
                "name": "Service Connect",
                "status": "planning",
                "summary": "Single sign-on across government services.",
            },
        ],
        "metrics": [
            {"label": "Citizens enrolled", "value": "2.1M"},
            {"label": "Counties covered", "value": "15 / 15"},
            {"label": "Consent events / month", "value": "640k"},
        ],
        "partners": [
            "NIR",
            "Ministry of Internal Affairs",
            "ID4Africa",
            "GSMA",
            "World Bank ID4D",
        ],
    },
    {
        "slug": "e-government",
        "title": "E-Government Services",
        "tagline": "Bringing every ministry online — permits, healthcare, education, licensing.",
        "sector": "Public Services",
        "icon": "building-2",
        "overview": (
            "E-Government replaces queues, paper forms and lost files with secure online "
            "services accessible from any phone. Birth certificates, business permits, "
            "school records, hospital appointments and more — delivered in minutes, not months."
        ),
        "objectives": [
            "Single citizen portal for 100+ public services",
            "Digital health records linked to National Digital ID",
            "Online school enrolment, transcripts and exam results",
            "Land registry digitization for transparent ownership",
        ],
        "programmes": [
            {
                "name": "MyLiberia Portal",
                "status": "active",
                "summary": "Unified citizen services portal.",
            },
            {
                "name": "Digital Health Records",
                "status": "piloting",
                "summary": "Patient-controlled records across hospitals.",
            },
            {
                "name": "Land Registry Digital",
                "status": "planning",
                "summary": "Tamper-proof land titles.",
            },
        ],
        "metrics": [
            {"label": "Services online", "value": "47"},
            {"label": "Citizens using portal", "value": "920k"},
            {"label": "Avg. processing time cut", "value": "-78%"},
        ],
        "partners": ["MOPT", "MOH", "MOE", "LLA", "UNDP"],
    },
]

INITIATIVES: List[dict] = [
    {
        "id": "i1",
        "title": "Broadband for Counties",
        "sector": "Economy",
        "status": "active",
        "region": "Lofa, Nimba, Grand Gedeh",
        "summary": "Last-mile fiber & wireless to 12 districts.",
        "pillar_slug": "digital-economy",
    },
    {
        "id": "i2",
        "title": "Tap & Trade Markets",
        "sector": "Markets",
        "status": "active",
        "region": "Montserrado, Bong",
        "summary": "QR-code payments for 12,000 market vendors.",
        "pillar_slug": "digital-markets",
    },
    {
        "id": "i3",
        "title": "FarmTrace Cocoa",
        "sector": "Markets",
        "status": "piloting",
        "region": "Lofa, Bong",
        "summary": "Farm-to-port traceability for cocoa exports.",
        "pillar_slug": "digital-markets",
    },
    {
        "id": "i4",
        "title": "Register-in-a-Day",
        "sector": "Business",
        "status": "active",
        "region": "Nationwide",
        "summary": "Online SME registration in 24 hours.",
        "pillar_slug": "business-sme",
    },
    {
        "id": "i5",
        "title": "LiberiaPay Switch",
        "sector": "Finance",
        "status": "active",
        "region": "Nationwide",
        "summary": "Real-time interoperable payments across banks & MNOs.",
        "pillar_slug": "banking-fintech",
    },
    {
        "id": "i6",
        "title": "FinTech Sandbox",
        "sector": "Finance",
        "status": "piloting",
        "region": "Monrovia",
        "summary": "Regulated environment for licensed fintech innovators.",
        "pillar_slug": "banking-fintech",
    },
    {
        "id": "i7",
        "title": "LIB-ID Enrollment Drive",
        "sector": "Identity",
        "status": "active",
        "region": "All 15 counties",
        "summary": "Mobile teams enrolling 5,000 citizens daily.",
        "pillar_slug": "national-digital-id",
    },
    {
        "id": "i8",
        "title": "Consent Wallet",
        "sector": "Identity",
        "status": "piloting",
        "region": "Montserrado",
        "summary": "Citizen-controlled data sharing app.",
        "pillar_slug": "national-digital-id",
    },
    {
        "id": "i9",
        "title": "MyLiberia Portal",
        "sector": "Public Services",
        "status": "active",
        "region": "Nationwide",
        "summary": "Unified portal for 47 government services.",
        "pillar_slug": "e-government",
    },
    {
        "id": "i10",
        "title": "Digital Health Records",
        "sector": "Public Services",
        "status": "piloting",
        "region": "Margibi, Bomi",
        "summary": "Patient-controlled records across 22 hospitals.",
        "pillar_slug": "e-government",
    },
    {
        "id": "i11",
        "title": "Open Data Liberia",
        "sector": "Economy",
        "status": "piloting",
        "region": "Nationwide",
        "summary": "Public datasets for budget, health, education.",
        "pillar_slug": "digital-economy",
    },
    {
        "id": "i12",
        "title": "Land Registry Digital",
        "sector": "Public Services",
        "status": "planning",
        "region": "Nationwide",
        "summary": "Tamper-proof land titles & transparent ownership.",
        "pillar_slug": "e-government",
    },
]


# ============================================================
# EMAIL HELPERS
# ============================================================

async def send_email(to_email: str, subject: str, html: str) -> Optional[str]:
    if resend is None:
        logger.warning("Resend package is not installed; skipping email")
        return None

    if not RESEND_API_KEY:
        logger.warning("Resend API key not configured; skipping email")
        return None

    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [to_email],
            "subject": subject,
            "html": html,
        }

        result = await asyncio.to_thread(resend.emails.send, params)

        if isinstance(result, dict):
            return result.get("id")

        return None

    except Exception as e:
        logger.error(f"Resend error: {e}")
        return None


def contact_email_html(c: ContactRecord) -> str:
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Inter,Arial,sans-serif;background:#f7f4ee;padding:24px;">
      <tr><td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 4px 12px rgba(0,40,104,0.08);">
          <tr><td style="background:#002868;color:#ffffff;padding:24px 28px;">
            <h2 style="margin:0;font-family:Georgia,serif;font-size:22px;">Digital Liberia · New Inquiry</h2>
            <p style="margin:6px 0 0;color:#cfd6e6;font-size:13px;letter-spacing:1px;text-transform:uppercase;">National Tech Initiative</p>
          </td></tr>
          <tr><td style="padding:28px;color:#0e1726;">
            <p style="margin:0 0 18px;font-size:15px;line-height:1.6;">A new partnership inquiry has been received via the Digital Liberia website.</p>
            <table width="100%" cellpadding="8" cellspacing="0" style="font-size:14px;border-collapse:collapse;">
              <tr><td style="background:#f7f4ee;width:130px;color:#495069;">Name</td><td style="background:#ffffff;border-left:3px solid #bf0a30;"><strong>{c.name}</strong></td></tr>
              <tr><td style="background:#f7f4ee;color:#495069;">Email</td><td style="background:#ffffff;border-left:3px solid #bf0a30;">{c.email}</td></tr>
              <tr><td style="background:#f7f4ee;color:#495069;">Organization</td><td style="background:#ffffff;border-left:3px solid #bf0a30;">{c.organization or "—"}</td></tr>
              <tr><td style="background:#f7f4ee;color:#495069;">Sector</td><td style="background:#ffffff;border-left:3px solid #bf0a30;">{c.sector or "—"}</td></tr>
            </table>
            <h3 style="margin:24px 0 8px;font-family:Georgia,serif;color:#002868;">Message</h3>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#0e1726;white-space:pre-wrap;">{c.message}</p>
          </td></tr>
          <tr><td style="background:#07112a;color:#9aa3b8;padding:18px 28px;font-size:12px;">
            Submitted {c.created_at} · Inquiry ID {c.id}
          </td></tr>
        </table>
      </td></tr>
    </table>
    """


def newsletter_email_html(email: str) -> str:
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Inter,Arial,sans-serif;background:#f7f4ee;padding:24px;">
      <tr><td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:14px;overflow:hidden;">
          <tr><td style="background:#002868;color:#fff;padding:28px;text-align:center;">
            <h2 style="margin:0;font-family:Georgia,serif;">Welcome to Digital Liberia</h2>
          </td></tr>
          <tr><td style="padding:28px;color:#0e1726;font-size:15px;line-height:1.7;">
            <p>Thank you for joining the Digital Liberia mailing list at <strong>{email}</strong>.</p>
            <p>You'll receive periodic updates on the six national pillars — Digital Economy, Markets,
            Business & SME Tech, Banking & FinTech, National Digital ID, and E-Government —
            as we build the next chapter of the republic.</p>
            <p style="margin-top:24px;color:#495069;font-size:13px;">— The Digital Liberia Initiative</p>
          </td></tr>
        </table>
      </td></tr>
    </table>
    """


# ============================================================
# ROUTES
# ============================================================

@api_router.get("/")
async def root():
    return {"service": "Digital Liberia API", "status": "online"}


@api_router.get("/health")
async def health():
    return {"status": "ok", "time": now_iso()}


@api_router.get("/services", response_model=List[ServiceSummary])
async def list_services():
    return [
        {
            "slug": s["slug"],
            "title": s["title"],
            "tagline": s["tagline"],
            "sector": s["sector"],
            "icon": s["icon"],
        }
        for s in SERVICES
    ]


@api_router.get("/services/{slug}", response_model=ServiceDetail)
async def get_service(slug: str):
    for s in SERVICES:
        if s["slug"] == slug:
            return s

    raise HTTPException(status_code=404, detail="Service not found")


@api_router.get("/initiatives", response_model=List[Initiative])
async def list_initiatives(
    sector: Optional[str] = None,
    status: Optional[str] = None,
    pillar: Optional[str] = None,
):
    items = INITIATIVES

    if sector:
        items = [i for i in items if i["sector"].lower() == sector.lower()]

    if status:
        items = [i for i in items if i["status"].lower() == status.lower()]

    if pillar:
        items = [i for i in items if i["pillar_slug"] == pillar]

    return items


@api_router.get("/stats")
async def get_stats():
    contact_count = await db.contacts.count_documents({})
    newsletter_count = await db.newsletter.count_documents({})

    return {
        "counties": 15,
        "pillars": len(SERVICES),
        "initiatives_total": len(INITIATIVES),
        "initiatives_active": len([i for i in INITIATIVES if i["status"] == "active"]),
        "citizens_enrolled": "2.1M",
        "contact_submissions": contact_count,
        "newsletter_subscribers": newsletter_count,
    }


@api_router.post("/contact", response_model=ContactRecord)
async def submit_contact(payload: ContactCreate):
    record = ContactRecord(**payload.model_dump())
    doc = record.model_dump()

    await db.contacts.insert_one(doc)

    email_id = await send_email(
        to_email=CONTACT_RECIPIENT,
        subject=f"Digital Liberia · New inquiry from {record.name}",
        html=contact_email_html(record),
    )

    if email_id:
        await db.contacts.update_one(
            {"id": record.id},
            {"$set": {"email_sent": True}},
        )
        record.email_sent = True

    return record


@api_router.get("/contact", response_model=List[ContactRecord])
async def list_contacts():
    items = await (
        db.contacts
        .find({}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(500)
    )

    return items


@api_router.post("/newsletter", response_model=NewsletterRecord)
async def subscribe_newsletter(payload: NewsletterCreate):
    normalized_email = payload.email.lower()

    existing = await db.newsletter.find_one(
        {"email": normalized_email},
        {"_id": 0},
    )

    if existing:
        return existing

    record = NewsletterRecord(email=normalized_email)
    doc = record.model_dump()

    await db.newsletter.insert_one(doc)

    await send_email(
        to_email=record.email,
        subject="Welcome to Digital Liberia",
        html=newsletter_email_html(record.email),
    )

    return record


@api_router.get("/newsletter", response_model=List[NewsletterRecord])
async def list_newsletter():
    items = await (
        db.newsletter
        .find({}, {"_id": 0})
        .sort("created_at", -1)
        .to_list(1000)
    )

    return items


# ============================================================
# APP WIRING
# ============================================================

app.include_router(api_router)