--Fluffal Sheep
function c13790430.initial_effect(c)
	--special summon
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_FIELD)
	e1:SetCode(EFFECT_SPSUMMON_PROC)
	e1:SetProperty(EFFECT_FLAG_SPSUM_PARAM)
	e1:SetRange(LOCATION_HAND)
	e1:SetTargetRange(POS_FACEUP,0)
	e1:SetCondition(c13790430.spcon)
	c:RegisterEffect(e1)
	local e2=Effect.CreateEffect(c)
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetType(EFFECT_TYPE_IGNITION)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1,13790430)
	e2:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e2:SetCost(c13790430.spcost)
	e2:SetTarget(c13790430.sptg)
	e2:SetOperation(c13790430.spop)
	c:RegisterEffect(e2)
end
function c13790430.sfilter(c)
	return c:IsFaceup() and c:IsSetCard(0xa9)
end
function c13790430.spcon(e,c)
	if c==nil then return true end
	return Duel.GetLocationCount(c:GetControler(),LOCATION_MZONE)>0
		and Duel.IsExistingMatchingCard(c13790430.sfilter,c:GetControler(),LOCATION_MZONE,0,1,nil)
end
function c13790430.cfilter(c)
	return c:IsFaceup() and c:IsSetCard(0xa9) and c:IsAbleToHandAsCost()
end
function c13790430.spcost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c13790430.cfilter,tp,LOCATION_MZONE,0,1,e:GetHandler()) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_RTOHAND)
	local g=Duel.SelectMatchingCard(tp,c13790430.cfilter,tp,LOCATION_MZONE,0,1,1,e:GetHandler())
	Duel.SendtoHand(g,nil,REASON_COST)
end
function c13790430.filter(c,e,tp)
	return (c:IsSetCard(0x1378) or c:GetCode()==30068120) and c:IsCanBeSpecialSummoned(e,0,tp,false,false)
end
function c13790430.sptg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_GRAVE+LOCATION_HAND) and chkc:IsControler(tp) and c13790430.filter(chkc,e,tp) end
	if chk==0 then return Duel.IsExistingTarget(c13790430.filter,tp,LOCATION_GRAVE+LOCATION_HAND,0,1,nil,e,tp) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,g,1,0,0)
end
function c13790430.spop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectMatchingCard(tp,c13790430.filter,tp,LOCATION_GRAVE+LOCATION_HAND,0,1,1,nil,e,tp)
	local tc=g:GetFirst()
	if tc and Duel.SpecialSummonStep(tc,0,tp,tp,false,false,POS_FACEUP) then
	end
	Duel.SpecialSummonComplete()
end
