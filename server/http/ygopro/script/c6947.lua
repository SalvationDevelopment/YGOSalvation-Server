--Kozmojo
function c6947.initial_effect(c)
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCountLimit(1,6947)
	e1:SetTarget(c6947.destg)
	e1:SetOperation(c6947.desop)
	c:RegisterEffect(e1)
end

function c6947.desfilter(c)
	return c:IsFaceup() and c:IsSetCard(0xd2) and c:IsDestructable()
end

function c6947.destg(e,tp,eg,ep,ev,re,r,rp,chk)
 if chk==0 then return Duel.IsExistingTarget(c6947.desfilter,tp,LOCATION_MZONE,0,1,nil) end
 Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
 local g=Duel.SelectTarget(tp,c6947.desfilter,tp,LOCATION_MZONE,0,1,1,nil)
 Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,1,0,0)
end

function c6947.desop(e,tp,eg,ep,ev,re,r,rp)
	local tc=Duel.GetFirstTarget()
	if tc:IsRelateToEffect(e) and Duel.Destroy(tc,REASON_EFFECT)~=0 then
		local b1=Duel.IsExistingMatchingCard(Card.IsAbleToRemove,tp,0,LOCATION_ONFIELD,1,nil)
		local b2=Duel.IsExistingMatchingCard(Card.IsAbleToRemove,tp,0,LOCATION_GRAVE,1,nil)
		local op=0
		if b1 and b2 then
			op=Duel.SelectOption(tp,aux.Stringid(6947,0),aux.Stringid(6947,1))
		else
			op=2
		end
		Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_REMOVE)
		local g=nil
		if op==0 then
			g=Duel.SelectTarget(tp,Card.IsAbleToRemove,tp,0,LOCATION_ONFIELD,1,1,nil)
		elseif op==1 then
			g=Duel.SelectTarget(tp,Card.IsAbleToRemove,tp,0,LOCATION_GRAVE,1,1,nil)
		else
			g=Duel.SelectTarget(tp,Card.IsAbleToRemove,tp,0,LOCATION_ONFIELD+LOCATION_GRAVE,1,1,nil)
		end
		Duel.Remove(g,POS_FACEUP,REASON_EFFECT)
	end
end