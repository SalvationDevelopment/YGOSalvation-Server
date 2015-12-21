--Assault Blackwing - Raikiri the Sudden Shower
function c13790647.initial_effect(c)
	--synchro summon
	aux.AddSynchroProcedure(c,nil,aux.NonTuner(nil),1)
	c:EnableReviveLimit()
	local e1=Effect.CreateEffect(c)
	e1:SetCategory(CATEGORY_REMOVE+CATEGORY_DAMAGE)
	e1:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_CONTINUOUS)
	e1:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e1:SetCode(EVENT_SPSUMMON_SUCCESS)
	e1:SetCondition(c13790647.condition)
	e1:SetOperation(c13790647.tuner)
	c:RegisterEffect(e1)
	--special summon
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(51808422,0))
	e3:SetCategory(CATEGORY_SPECIAL_SUMMON)
	e3:SetType(EFFECT_TYPE_IGNITION)
	e3:SetProperty(EFFECT_FLAG_CARD_TARGET)
	e3:SetRange(LOCATION_MZONE)
	e3:SetCountLimit(1)
	e3:SetTarget(c13790647.target)
	e3:SetOperation(c13790647.operation)
	c:RegisterEffect(e3)
end
function c13790647.condition(e,tp,eg,ep,ev,re,r,rp)
	return e:GetHandler():GetSummonType()==SUMMON_TYPE_SYNCHRO
end
function c13790647.tuner(e,tp,eg,ep,ev,re,r,rp)
	local g=e:GetHandler():GetMaterial()
		if g:IsExists(Card.IsSetCard,1,nil,0x33) then
			local e1=Effect.CreateEffect(e:GetHandler())
			e1:SetType(EFFECT_TYPE_SINGLE)
			e1:SetCode(EFFECT_ADD_TYPE)
			e1:SetReset(RESET_EVENT+0x1fe0000)
			e1:SetValue(TYPE_TUNER)
			e:GetHandler():RegisterEffect(e1)
		else 
	end
end

function c13790647.filter1(c)
	return c:IsFaceup() and c:IsDestructable()
end
function c13790647.cfilter1(c)
	return c:IsFaceup() and c:IsSetCard(0x33)
end

function c13790647.target(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsOnField() and chkc:IsDestructable() end
	if chk==0 then return Duel.IsExistingTarget(Card.IsDestructable,tp,0,LOCATION_ONFIELD,1,nil)
	and Duel.IsExistingTarget(c13790647.cfilter1,tp,LOCATION_MZONE,0,1,e:GetHandler())  end
	local ct=Duel.GetMatchingGroupCount(c13790647.cfilter1,tp,LOCATION_MZONE,0,e:GetHandler())
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g=Duel.SelectTarget(tp,Card.IsDestructable,tp,0,LOCATION_ONFIELD,1,ct,nil)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g,g:GetCount(),0,0)
end
function c13790647.operation(e,tp,eg,ep,ev,re,r,rp)
	local tg=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	if tg then
		local sg=tg:Filter(Card.IsRelateToEffect,nil,e)
		Duel.Destroy(sg,REASON_EFFECT)
	end
end
