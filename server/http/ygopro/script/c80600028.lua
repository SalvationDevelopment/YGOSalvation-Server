--幻獣機グリーフィン
function c80600028.initial_effect(c)
	--Special Summon
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_HAND)
	e1:SetCost(c80600028.sscost)
	e1:SetOperation(c80600028.ssop)
	c:RegisterEffect(e1)
	--
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCode(EFFECT_INDESTRUCTABLE_BATTLE)
	e2:SetCondition(c80600028.indcon)
	e2:SetValue(1)
	c:RegisterEffect(e2)
	local e3=e2:Clone()
	e3:SetCode(EFFECT_INDESTRUCTABLE_EFFECT)
	c:RegisterEffect(e3)
	--token
	local e4=Effect.CreateEffect(c)
	e4:SetCategory(CATEGORY_SPECIAL_SUMMON+CATEGORY_TOKEN)
	e4:SetType(EFFECT_TYPE_IGNITION)
	e4:SetCountLimit(1)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCost(c80600028.sscost2)
	e4:SetOperation(c80600028.ssop2)
	c:RegisterEffect(e4)
end
function c80600028.indcon(e)
	return Duel.IsExistingMatchingCard(Card.IsType,e:GetHandlerPlayer(),LOCATION_MZONE,0,1,nil,TYPE_TOKEN)
end
function c80600028.sscost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetFlagEffect(tp,80600028)==0 and Duel.CheckReleaseGroup(tp,Card.IsSetCard,2,nil,0x101b) end
	local g=Duel.SelectReleaseGroup(tp,Card.IsSetCard,2,2,nil,0x101b)
	Duel.Release(g,REASON_COST)
	Duel.RegisterFlagEffect(tp,80600028,RESET_PHASE+PHASE_END,0,1)
end
function c80600028.ssop(e,tp,eg,ep,ev,re,r,rp)
	Duel.SpecialSummon(e:GetHandler(),0,tp,tp,false,false,POS_FACEUP)
end
function c80600028.sscost2(e,tp,eg,ep,ev,re,r,rp,chk)
if chk==0 then return Duel.IsExistingMatchingCard(c80600028.spfilter,tp,LOCATION_HAND,0,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DISCARD)
	local g=Duel.SelectMatchingCard(tp,c80600028.spfilter,tp,LOCATION_HAND,0,1,1,nil)
	Duel.SendtoGrave(g,REASON_COST+REASON_DISCARD)
end
function c80600028.spfilter(c)
	return c:IsType(TYPE_MONSTER) and c:IsSetCard(0x101b)
end
function c80600028.ssop2(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	if Duel.IsPlayerCanSpecialSummonMonster(tp,31533705,0x101b,0x4011,0,0,3,RACE_MACHINE,ATTRIBUTE_WIND) then
		local token=Duel.CreateToken(tp,31533705)
		Duel.SpecialSummon(token,0,tp,tp,false,false,POS_FACEUP)
	end
end