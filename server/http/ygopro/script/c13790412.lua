--Parent Seahorse
function c13790412.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_IGNITION)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(3,13790412)
	e1:SetTarget(c13790412.sptg)
	e1:SetOperation(c13790412.spop)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_SINGLE)
	e2:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e2:SetCode(EFFECT_SPSUMMON_CONDITION)
	e2:SetValue(c13790412.splimit)
	c:RegisterEffect(e2)
end
function c13790412.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and Duel.IsPlayerCanSpecialSummonMonster(tp,13791412,0,0x4011,300,200,1,RACE_WYRM,ATTRIBUTE_WATER) end
	Duel.SetOperationInfo(0,CATEGORY_TOKEN,nil,1,0,0)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,0,0)
end
function c13790412.spop(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 or not e:GetHandler():IsRelateToEffect(e) or	e:GetHandler():GetLevel()<=1 then return end
	local c=e:GetHandler()
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_UPDATE_LEVEL)
	e1:SetReset(RESET_EVENT+0x1fe0000)
	e1:SetValue(-1)
	c:RegisterEffect(e1)
	if not Duel.IsPlayerCanSpecialSummonMonster(tp,13791412,0,0x4011,300,200,1,RACE_WYRM,ATTRIBUTE_WATER) then return end
	local token=Duel.CreateToken(tp,13791412)
	Duel.SpecialSummon(token,0,tp,tp,false,false,POS_FACEUP)
end

function c13790412.splimit(e,se,sp,st)
	return se:GetHandler():IsRace(RACE_WYRM)
end
