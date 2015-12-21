--CNo.106 溶岩掌ジャイアント·ハンド·レッド
function c805000081.initial_effect(c)
	--xyz summon
	aux.AddXyzProcedure(c,aux.XyzFilterFunction(c,5),3)
	c:EnableReviveLimit()
	--negate activate
	local e2=Effect.CreateEffect(c)
	e2:SetDescription(aux.Stringid(805000081,0))
	e2:SetCategory(CATEGORY_DISABLE)
	e2:SetProperty(EFFECT_FLAG_DAMAGE_STEP+EFFECT_FLAG_DAMAGE_CAL)
	e2:SetType(EFFECT_TYPE_FIELD+EFFECT_TYPE_QUICK_F)
	e2:SetRange(LOCATION_MZONE)
	e2:SetCountLimit(1)
	e2:SetCode(EVENT_CHAINING)
	e2:SetCondition(c805000081.condition)
	e2:SetTarget(c805000081.target)
	e2:SetOperation(c805000081.operation)
	c:RegisterEffect(e2)
end
function c805000081.condition(e,tp,eg,ep,ev,re,r,rp,chk)
	local loc=Duel.GetChainInfo(ev,CHAININFO_TRIGGERING_LOCATION)
	return not e:GetHandler():IsStatus(STATUS_BATTLE_DESTROYED) 
		and (loc==LOCATION_SZONE or loc==LOCATION_MZONE)
		and e:GetHandler():GetOverlayGroup():IsExists(Card.IsSetCard,1,nil,0x48)
end
function c805000081.filter(c)
	return c:IsFaceup() and not c:IsType(TYPE_NORMAL)
end
function c805000081.target(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c805000081.filter,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,1,e:GetHandler()) 
	and e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_EFFECT)
	end
end
function c805000081.operation(e,tp,eg,ep,ev,re,r,rp)
	if 	e:GetHandler():CheckRemoveOverlayCard(tp,1,REASON_EFFECT) and 
		e:GetHandler():RemoveOverlayCard(tp,1,1,REASON_EFFECT)
	then
		local g=Duel.GetMatchingGroup(c805000081.filter,tp,LOCATION_ONFIELD,LOCATION_ONFIELD,e:GetHandler())
		local tc=g:GetFirst()
		local c=e:GetHandler()
		while tc do
			local e1=Effect.CreateEffect(c)
			e1:SetType(EFFECT_TYPE_SINGLE)
			e1:SetCode(EFFECT_DISABLE)
			e1:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
			tc:RegisterEffect(e1)
			local e2=Effect.CreateEffect(c)
			e2:SetType(EFFECT_TYPE_SINGLE)
			e2:SetCode(EFFECT_DISABLE_EFFECT)
			e2:SetReset(RESET_EVENT+0x1fe0000+RESET_PHASE+PHASE_END)
			tc:RegisterEffect(e2)
			tc=g:GetNext()
		end
	end
end


