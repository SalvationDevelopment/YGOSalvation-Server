--Ultimitl Bishbalkin the Ultimate Legendary One
function c13701823.initial_effect(c)
	c:EnableReviveLimit()
	--spsummon condition
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	c:RegisterEffect(e1)
	--special summon rule
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_SPSUMMON_PROC)
	e2:SetProperty(EFFECT_FLAG_UNCOPYABLE)
	e2:SetRange(LOCATION_EXTRA)
	e2:SetCondition(c13701823.sprcon)
	e2:SetOperation(c13701823.sprop)
	c:RegisterEffect(e2)
	--battle indestructable
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
	e3:SetValue(1)
	c:RegisterEffect(e3)
	--atk
	local e4=Effect.CreateEffect(c)
	e4:SetType(EFFECT_TYPE_SINGLE)
	e4:SetCode(EFFECT_SET_ATTACK)
	e4:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e4:SetRange(LOCATION_MZONE)
	e4:SetValue(c13701823.adval)
	c:RegisterEffect(e4)
	--damage
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(11501629,0))
	e3:SetCategory(CATEGORY_TOKEN)
	e3:SetType(EFFECT_TYPE_QUICK_O)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCode(EVENT_FREE_CHAIN)
	--e3:SetHintTiming(TIMING_STANDBY_PHASE)
	e3:SetCountLimit(1)
	e3:SetCondition(c13701823.damcon)
	e3:SetTarget(c13701823.damtg)
	e3:SetOperation(c13701823.damop)
	c:RegisterEffect(e3)
end
function c13701823.sprfilter1(c,tp)
	local lv=c:GetLevel()
	return lv>8 and c:IsFaceup() and c:IsType(TYPE_TUNER) and c:IsAbleToGraveAsCost()
		and Duel.IsExistingMatchingCard(c13701823.sprfilter2,tp,LOCATION_MZONE,0,1,nil,lv)
end
function c13701823.sprfilter2(c,lv)
	return c:IsFaceup() and c:GetLevel()==lv and not c:IsType(TYPE_TUNER) and c:IsAbleToGraveAsCost()
end
function c13701823.sprcon(e,c)
	if c==nil then return true end
	local tp=c:GetControler()
	return Duel.GetLocationCount(tp,LOCATION_MZONE)>-2
		and Duel.IsExistingMatchingCard(c13701823.sprfilter1,tp,LOCATION_MZONE,0,1,nil,tp)
end
function c13701823.sprop(e,tp,eg,ep,ev,re,r,rp,c)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g1=Duel.SelectMatchingCard(tp,c13701823.sprfilter1,tp,LOCATION_MZONE,0,1,1,nil,tp)
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_TOGRAVE)
	local g2=Duel.SelectMatchingCard(tp,c13701823.sprfilter2,tp,LOCATION_MZONE,0,1,1,nil,g1:GetFirst():GetLevel())
	g1:Merge(g2)
	Duel.SendtoGrave(g1,REASON_COST)
end

function c13701823.adval(e,c)
	return Duel.GetFieldGroupCount(c:GetControler(),LOCATION_MZONE,LOCATION_MZONE)*1000
end


function c13701823.damcon(e,tp,eg,ep,ev,re,r,rp)
	local ph=Duel.GetCurrentPhase()
	return ph==PHASE_MAIN1 or ph==PHASE_MAIN2
end
function c13701823.damtg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0 and Duel.GetLocationCount(1-tp,LOCATION_MZONE)>0  end
	local ft=Duel.GetLocationCount(tp,LOCATION_MZONE,LOCATION_MZONE)
	Duel.SetOperationInfo(0,CATEGORY_TOKEN,nil,ft,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,ft,0,0)
end
function c13701823.damop(e,tp,eg,ep,ev,re,r,rp)
	local ft=Duel.GetLocationCount(tp,LOCATION_MZONE)
	local ft2=Duel.GetLocationCount(tp,0,LOCATION_MZONE)
	if (ft<=0 and ft2<=0) then return end
	while Duel.GetLocationCount(1-tp,LOCATION_MZONE)>0 and Duel.GetLocationCount(tp,LOCATION_MZONE)>0 do
		local token=Duel.CreateToken(tp,13701824)
		Duel.SpecialSummonStep(token,0,tp,1-tp,false,false,POS_FACEUP_DEFENCE)
		local token=Duel.CreateToken(tp,13701824)
		Duel.SpecialSummonStep(token,0,tp,tp,false,false,POS_FACEUP_DEFENCE)
	end
	Duel.SpecialSummonComplete()
	local e1=Effect.CreateEffect(e:GetHandler())
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_CANNOT_ATTACK)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_OATH)
	e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
	e:GetHandler():RegisterEffect(e1)
end
