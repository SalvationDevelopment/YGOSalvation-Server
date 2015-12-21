--Number S0: Utopic Z
function c13720106.initial_effect(c)
	c:EnableReviveLimit()
	--xyz summon
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(13720106,0))
	e1:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetRange(LOCATION_EXTRA)
	e1:SetCondition(c13720106.xyzcon)
	e1:SetOperation(c13720106.xyzop)
	e1:SetValue(SUMMON_TYPE_XYZ)
	c:RegisterEffect(e1)
	--xyz summon 2
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(13720106,1))
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetRange(LOCATION_EXTRA)
	e2:SetCondition(c13720106.xyzcon2)
	e2:SetOperation(c13720106.xyzop2)
	e2:SetValue(SUMMON_TYPE_XYZ)
	c:RegisterEffect(e2)
	--no negate
	local e3=Effect.CreateEffect(c)
	e3:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_SPSUMMON_CONDITION)
	c:RegisterEffect(e3)
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetCode(EFFECT_CANNOT_DISABLE_SPSUMMON)
	e4:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	c:RegisterEffect(e4)
	--summon success
	local e5=Effect.CreateEffect(c)
	e5:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e5:SetCode(EVENT_SPSUMMON_SUCCESS)
	e5:SetOperation(c13720106.sumsuc)
	c:RegisterEffect(e5)
	--atk/def
	local e6=Effect.CreateEffect(c)
	e6:SetType(EFFECT_TYPE_SINGLE)
	e6:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e6:SetRange(LOCATION_MZONE)
	e6:SetCode(EFFECT_UPDATE_ATTACK)
	e6:SetValue(c13720106.adval)
	c:RegisterEffect(e6)
	local e7=e6:Clone()
	e7:SetCode(EFFECT_UPDATE_DEFENCE)
	c:RegisterEffect(e7)
	--cannot activate
	local e8=Effect.CreateEffect(c)
	e8:SetDescription(aux.Stringid(13720106,2))
	e8:SetType(EFFECT_TYPE_QUICK_O)
	e8:SetCode(EVENT_FREE_CHAIN)
	e8:SetRange(LOCATION_MZONE)
	e8:SetCountLimit(1)
	e8:SetCondition(c13720106.condition)
	e8:SetCost(c13720106.cost)
	e8:SetOperation(c13720106.operation)
	c:RegisterEffect(e8)
end
function c13720106.sumsuc(e,tp,eg,ep,ev,re,r,rp)
	if e:GetHandler():GetSummonType()~=SUMMON_TYPE_XYZ then return end
	Duel.SetChainLimitTillChainEnd(aux.FALSE)
end
function c13720106.cfilter(c)
	return c:IsSetCard(0x95) and c:IsType(TYPE_SPELL) and c:IsDiscardable() and not c:IsType(TYPE_QUICKPLAY)
end
function c13720106.ovfilter(c)
	return c:IsFaceup() and c:IsSetCard(0x7f)  and not c:IsCode(56832966)
end
function c13720106.mfilter(c)
	return c:IsFaceup() and c:IsType(TYPE_XYZ) and c:IsSetCard(0x48) and not c:IsCode(56832966)
end
function c13720106.xyzcon2(e,c,og)
	if c==nil then return true end
	local tp=c:GetControler()
	local mg=Duel.GetMatchingGroup(c13720106.ovfilter,tp,LOCATION_MZONE,0,nil)
	return Duel.GetLocationCount(tp,LOCATION_MZONE)>-1
		and mg:IsExists(c13720106.ovfilter,1,nil,mg)
		and Duel.IsExistingMatchingCard(c13720106.cfilter,tp,LOCATION_HAND,0,1,nil)
end
function c13720106.xyzop2(e,tp,eg,ep,ev,re,r,rp,c,og)
	if chk==0 then return Duel.IsExistingMatchingCard(c13720106.cfilter,tp,LOCATION_HAND,0,1,nil) end
	local mg=Duel.GetMatchingGroup(c13720106.ovfilter,tp,LOCATION_MZONE,0,nil)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_XMATERIAL)
	local g1=mg:FilterSelect(tp,c13720106.ovfilter,1,1,nil,mg)
	local tc1=g1:GetFirst()
	local sg1=tc1:GetOverlayGroup()
	Duel.DiscardHand(tp,c13720106.cfilter,1,1,REASON_COST+REASON_DISCARD)
	c:SetMaterial(g1)
	Duel.Overlay(c,sg1)
	Duel.Overlay(c,g1)
end
function c13720106.xyzfilter1(c,g)
	return g:IsExists(c13720106.xyzfilter2,2,c,c:GetRank())
end
function c13720106.xyzfilter2(c,rk)
	return c:GetRank()==rk 
end
function c13720106.xyzcon(e,c,og)
	if c==nil then return true end
	local tp=c:GetControler()
	local mg=Duel.GetMatchingGroup(c13720106.mfilter,tp,LOCATION_MZONE,0,nil)
	return Duel.GetLocationCount(tp,LOCATION_MZONE)>-1
		and mg:IsExists(c13720106.xyzfilter1,1,nil,mg)
end
function c13720106.xyzop(e,tp,eg,ep,ev,re,r,rp,c,og)
	local mg=Duel.GetMatchingGroup(c13720106.mfilter,tp,LOCATION_MZONE,0,nil)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_XMATERIAL)
	local g1=mg:FilterSelect(tp,c13720106.xyzfilter1,1,1,nil,mg)
	local tc1=g1:GetFirst()
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_XMATERIAL)
	local g2=mg:FilterSelect(tp,c13720106.xyzfilter2,2,2,tc1,tc1:GetRank())
	local tc2=g2:GetFirst()
	g1:Merge(g2)
	local sg1=tc1:GetOverlayGroup()
	local sg2=tc2:GetOverlayGroup()
	sg1:Merge(sg2)
	Duel.SendtoGrave(sg1,REASON_RULE)
	c:SetMaterial(g1)
	Duel.Overlay(c,g1)
end
function c13720106.adval(e,c)
	return e:GetHandler():GetOverlayCount()*1000
end
function c13720106.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.GetTurnPlayer()~=tp
end
function c13720106.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_COST) end
	e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_COST)
end
function c13720106.operation(e,tp,eg,ep,ev,re,r,rp,chk)
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_OATH)
	e1:SetCode(EFFECT_CANNOT_ACTIVATE)
	e1:SetTargetRange(0,1)
	e1:SetValue(c13720106.aclimit)
	e1:SetReset(RESET_PHASE+PHASE_END)
	Duel.RegisterEffect(e1,tp)
end
function c13720106.aclimit(e,re,tp)
	return re:IsActiveType(TYPE_SPELL+TYPE_TRAP+TYPE_MONSTER)
end
