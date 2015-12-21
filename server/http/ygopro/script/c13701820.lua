--The Winged Dragon of Ra - God Phoenix
function c13701820.initial_effect(c)
	c:EnableReviveLimit()
	--cannot special summon
	local e1=Effect.CreateEffect(c)
	e1:SetProperty(EFFECT_FLAG_CANNOT_DISABLE+EFFECT_FLAG_UNCOPYABLE)
	e1:SetType(EFFECT_TYPE_SINGLE)
	e1:SetCode(EFFECT_SPSUMMON_CONDITION)
	c:RegisterEffect(e1)
	--special summon
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(13701820,0))
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_TRIGGER_O)
	e2:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e2:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DELAY)
	e2:SetCode(EVENT_TO_GRAVE)
	e2:SetRange(LOCATION_GRAVE)
	e2:SetCondition(c13701820.spcon)
	e2:SetTarget(c13701820.sptg)
	e2:SetOperation(c13701820.spop)
	c:RegisterEffect(e2)
	--unaffectable
	local e3=Effect.CreateEffect(c)
	e3:SetType(EFFECT_TYPE_SINGLE)
	e3:SetProperty(EFFECT_FLAG_SINGLE_RANGE)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCode(EFFECT_IMMUNE_EFFECT)
	e3:SetValue(c13701820.efilter)
	c:RegisterEffect(e3)
	--send to grave
	local e4=Effect.CreateEffect(c)
	e4:SetDescription(aux.Stringid(10000010,1))
	e4:SetCategory(CATEGORY_DESTROY)
	e4:SetType(EFFECT_TYPE_IGNITION)
	e4:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e4:SetRange(LOCATION_MZONE)
	e4:SetCost(c13701820.descost)
	e4:SetTarget(c13701820.destg)
	e4:SetOperation(c13701820.desop)
	c:RegisterEffect(e4)
	--to extra & Special summon
	local e5=Effect.CreateEffect(c)
	e5:SetDescription(aux.Stringid(7841112,2))
	e5:SetType(EFFECT_TYPE_TRIGGER_F+EFFECT_TYPE_FIELD)
	e5:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e5:SetRange(LOCATION_MZONE)
	e5:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e5:SetCountLimit(1)
	e5:SetCode(EVENT_PHASE+PHASE_END)
	e5:SetOperation(c13701820.spoperation)
	c:RegisterEffect(e5)

end
function c13701820.efilter(e,te)
	return te:GetOwner()~=e:GetOwner()
end
function c13701820.cfilter(c,tp)
	return c:IsCode(10000010) and c:IsControler(tp) and c:IsPreviousLocation(LOCATION_ONFIELD)
end
function c13701820.spcon(e,tp,eg,ep,ev,re,r,rp)
	return eg:IsExists(c13701820.cfilter,1,nil,tp)
end
function c13701820.sptg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.GetLocationCount(tp,LOCATION_MZONE)>0
		and e:GetHandler():IsCanBeSpecialSummoned(e,0,tp,true,true) end
	Duel.SetOperationInfo(0,CATEGORY_SPECIAL_SUMMON,e:GetHandler(),1,0,0)
	Duel.SetChainLimit(aux.FALSE)
end
function c13701820.spop(e,tp,eg,ep,ev,re,r,rp)
	local c=e:GetHandler()
	if c:IsRelateToEffect(e) and Duel.SpecialSummon(c,0,tp,tp,true,true,POS_FACEUP)>0 then
		c:CompleteProcedure()
	end
end

function c13701820.descost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.CheckLPCost(tp,1000) end
	Duel.PayLPCost(tp,1000)
end
function c13701820.destg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsLocation(LOCATION_MZONE) and chkc:IsDestructable() end
	if chk==0 then return Duel.IsExistingTarget(Card.IsDestructable,tp,LOCATION_MZONE,LOCATION_MZONE,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g=Duel.SelectTarget(tp,Card.IsDestructable,tp,LOCATION_MZONE,LOCATION_MZONE,1,1,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c13701820.desop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) then
		Duel.SendtoGrave(tc,REASON_EFFECT)
	end
end

function c13701820.spfilter(c,e,tp)
	return c:IsCode(10000080) and c:IsCanBeSpecialSummoned(e,0,tp,true,false)
end
function c13701820.spoperation(e,tp,eg,ep,ev,re,r,rp)
	if Duel.SendtoGrave(e:GetHandler(),REASON_EFFECT)~=0 then
	local g=Duel.SelectMatchingCard(tp,c13701820.spfilter,tp,LOCATION_DECK+LOCATION_HAND+LOCATION_GRAVE,0,1,1,nil,e,tp)
		if g:GetCount()>0 then
			Duel.SpecialSummon(g,0,tp,tp,true,false,POS_FACEUP)
		end
	end
end
