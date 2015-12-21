--Scripted by Eerie Code
--Red Wyvern
function c76547525.initial_effect(c)
	--synchro summon
	aux.AddSynchroProcedure(c,nil,aux.NonTuner(nil),1)
	c:EnableReviveLimit()
	--Destroy
	local e1=Effect.CreateEffect(c)
	e1:SetDescription(aux.Stringid(76547525,0))
	e1:SetCategory(CATEGORY_DESTROY)
	e1:SetType(EFFECT_TYPE_QUICK_O)
	e1:SetCode(EVENT_FREE_CHAIN)
	e1:SetProperty(EFFECT_FLAG_NO_TURN_RESET)
	e1:SetRange(LOCATION_MZONE)
	e1:SetCountLimit(1)
	e1:SetCondition(c76547525.descon)
	e1:SetTarget(c76547525.destg)
	e1:SetOperation(c76547525.desop)
	c:RegisterEffect(e1)
end

function c76547525.dafilter(c,atk)
	return c:IsFaceup() and c:GetAttack()>atk
end
function c76547525.descon(e)
	return e:GetHandler():GetSummonType()==SUMMON_TYPE_SYNCHRO and Duel.IsExistingMatchingCard(c76547525.dafilter,tp,LOCATION_MZONE,LOCATION_MZONE,1,e:GetHandler(),e:GetHandler():GetAttack())
end
function c76547525.desfil(c)
	return c:IsDestructable()
end
function c76547525.destg(e,tp,eg,ep,ev,re,r,rp,chk)
	if chk==0 then return Duel.IsExistingMatchingCard(c76547525.desfil,tp,LOCATION_MZONE,LOCATION_MZONE,1,e:GetHandler()) end
	local g=Duel.GetMatchingGroup(c76547525.desfil,tp,LOCATION_MZONE,LOCATION_MZONE,nil)
	local tg=g:GetMaxGroup(Card.GetAttack)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,tg,1,0,0)
end
function c76547525.desop(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetMatchingGroup(c76547525.desfil,tp,LOCATION_MZONE,LOCATION_MZONE,e:GetHandler())
	if g:GetCount()>0 then
		local tg=g:GetMaxGroup(Card.GetAttack)
		if tg:GetCount()>1 then
			Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
			local sg=tg:Select(tp,1,1,nil)
			Duel.HintSelection(sg)
			Duel.Destroy(sg,REASON_EFFECT)
		else Duel.Destroy(tg,REASON_EFFECT) end
	end
end