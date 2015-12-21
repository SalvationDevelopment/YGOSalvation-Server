--Shining Evolution
function c220.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetHintTiming(0,TIMING_END_PHASE)
	e1:SetCost(c220.cost)
	e1:SetTarget(c220.target)
	e1:SetOperation(c220.activate)
	c:RegisterEffect(e1)
end
function c220.costfilter(c)
	return c:IsFaceup() and c:IsCode(23995346) and c:IsAbleToGraveAsCost()
end
function c220.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckReleaseGroup(tp,Card.IsCode,1,nil,23995346) end
	local g=Duel.SelectReleaseGroup(tp,Card.IsCode,1,1,nil,23995346)
	Duel.Release(g,REASON_COST)
	e:SetLabelObject(g:GetFirst())
end
function c220.filter(c,e,tp)
	local code=c:GetCode()
	return (code==53347303) and c:IsCanBeSpecialSummoned(e,0,tp,true,false)
end

function c220.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0	
		and Duel.IsExistingTarget(c220.filter,tp,LOCATION_HAND+LOCATION_GRAVE+LOCATION_DECK,0,1,nil,e,tp)
	end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_SPSUMMON)
	local g=Duel.SelectTarget(tp,c220.filter,tp,LOCATION_DECK+LOCATION_GRAVE+LOCATION_HAND,0,1,1,nil,e,tp)
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,nil,1,tp,LOCATION_HAND+LOCATION_GRAVE+LOCATION_DECK)
	Duel.SetChainLimit(aux.FALSE)
end
	
function c220.activate(e,tp,eg,ep,ev,re,r,rp)
	if Duel.GetLocationCount(tp,LOCATION_MZONE)<=0 then return end
	local tc=Duel.GetFirstTarget()
	local c=e:GetHandler()
	if tc:IsRelateToEffect(e)  then
		if Duel.SpecialSummon(tc,0,tp,tp,true,false,POS_FACEUP)==0 then return end
		local e3=Effect.CreateEffect(e:GetHandler())
		e3:SetType(EFFECT_TYPE_SINGLE)
		e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE+EFFECT_FLAG_OWNER_RELATE)
		e3:SetRange(LOCATION_MZONE)
		e3:SetCode(EFFECT_IMMUNE_EFFECT)
		e3:SetValue(c220.efilter)
		e3:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
		tc:RegisterEffect(e3)
	end
end
	

function c220.efilter(e,re)
	return e:GetHandlerPlayer()~=re:GetHandlerPlayer()
end

