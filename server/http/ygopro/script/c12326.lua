--Mimicat
function c12326.initial_effect(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetCondition(c12326.condition)
	e1:SetCost(c12326.cost)
	e1:SetOperation(c12326.operation)	
	c:RegisterEffect(e1)
end	

function c12326.cost(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return true end
	local c=e:GetHandler()
	local g1=Duel.GetDecktopGroup(tp,5)
	Duel.DisableShuffleCheck()
	Duel.Remove(g1,POS_FACEUP,REASON_COST)
end

function c12326.operation(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetFieldGroup(tp,0,LOCATION_GRAVE)
	if g:GetCount()>0 then
		Duel.ConfirmCards(tp,g)
		local tg=g:Filter(Card.IsType,nil,TYPE_MONSTER+TYPE_SPELL+TYPE_TRAP)
		if tg:GetCount()>0 then
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_ATOHAND)
			local sg=tg:Select(tp,1,1,nil)
			Duel.SendtoHand(sg,tp,REASON_EFFECT)
		end
	end
end

function c12326.cfilter(c)
	return c:IsFaceup() and c:IsCode(15259703)
end
function c12326.condition(e,tp,eg,ep,ev,re,r,rp)
	return Duel.IsExistingMatchingCard(c12326.cfilter,tp,LOCATION_ONFIELD,0,1,nil)
		and Duel.GetFieldGroupCount(tp,0,LOCATION_GRAVE)~=0
end