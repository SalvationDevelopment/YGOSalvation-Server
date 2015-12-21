--Astellarknight – Sephira Byuuto
--CHIBI FIX ARCHETYPE CRAP NYANYANYANYANYANYANYANYANYANYANYANYANYA
--CHIBI FIX ARCHETYPE CRAP NYANYANYANYANYANYANYANYANYANYANYANYANYA
function c80100123.initial_effect(c)
--pendulum summon
	aux.AddPendulumProcedure(c)
	--Activate
	local e1=Effect.CreateEffect(c)
	e1:SetType(EFFECT_TYPE_ACTIVATE)
	e1:SetCode(EVENT_FREE_CHAIN)
	c:RegisterEffect(e1)
	--splimit
	local e2=Effect.CreateEffect(c)
	e2:SetType(EFFECT_TYPE_FIELD)
	e2:SetCode(EFFECT_CANNOT_SPECIAL_SUMMON)
	e2:SetProperty(EFFECT_FLAG_PLAYER_TARGET+EFFECT_FLAG_CANNOT_DISABLE)
	e2:SetRange(LOCATION_PZONE)
	e2:SetTargetRange(1,0)
	e2:SetTarget(c80100123.splimit)
	c:RegisterEffect(e2)
	--effect
	local e3=Effect.CreateEffect(c)
	e3:SetDescription(aux.Stringid(80100123,0))
	e3:SetCategory(CATEGORY_DESTROY)
	e3:SetType(EFFECT_TYPE_TRIGGER_O+EFFECT_TYPE_SINGLE)
	e3:SetCode(EVENT_SUMMON_SUCCESS)
	e3:SetCountLimit(1,80100123)
	e3:SetTarget(c80100123.tg)
	e3:SetOperation(c80100123.op)
	c:RegisterEffect(e3)
	local e4=e3:Clone()
	e4:SetCode(EVENT_FLIP_SUMMON_SUCCESS)
	c:RegisterEffect(e4)
	local e5=Effect.CreateEffect(c)
	e5:SetDescription(aux.Stringid(80100123,0))
	e5:SetCategory(CATEGORY_DESTROY)
	e5:SetType(EFFECT_TYPE_SINGLE+EFFECT_TYPE_TRIGGER_O)
	e5:SetCode(EVENT_SPSUMMON_SUCCESS)
	e5:SetCountLimit(1,80100123)
	e5:SetCondition(c80100123.spcon)
	e5:SetTarget(c80100123.tg)
	e5:SetOperation(c80100123.op)
	c:RegisterEffect(e5)
	
end
function c80100123.splimit(e,c,tp,sumtp,sumpos)
	return not c:IsSetCard(0x9c) and not c:IsSetCard(0xc3) and bit.band(sumtp,SUMMON_TYPE_PENDULUM)==SUMMON_TYPE_PENDULUM
end
function c80100123.cfilter(c)
	return c:IsFaceup() and (c:IsSetCard(0x9c) or c:IsSetCard(0xc3)) and c:IsDestructable() and (c:IsLocation(LOCATION_MZONE) or (c:GetSequence()==6 or c:GetSequence()==7))
end
function c80100123.cfilter2(c)
	return c:IsFacedown() 
end
function c80100123.spcon(e,tp,eg,ep,ev,re,r,rp)
	return  e:GetHandler():GetSummonType()==SUMMON_TYPE_PENDULUM
end
function c80100123.tg(e,tp,eg,ep,ev,re,r,rp,chk,chkc)
	if chkc then return chkc:IsControler(tp) and chkc:IsDestructable() end
	if chk==0 then return Duel.IsExistingTarget(c80100123.cfilter,tp,LOCATION_ONFIELD,0,1,e:GetHandler()) 
		and Duel.IsExistingTarget(c80100123.cfilter2,tp,0,LOCATION_ONFIELD,1,nil) end
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTORY)
	local g1=Duel.SelectTarget(tp,c80100123.cfilter,tp,LOCATION_ONFIELD,0,1,1,e:GetHandler())
	Duel.Hint(HINT_SELECTMSG,tp,HINTMSG_DESTROY)
	local g2=Duel.SelectTarget(tp,c80100123.cfilter2,tp,0,LOCATION_ONFIELD,1,1,nil)
	g1:Merge(g2)
	Duel.SetOperationInfo(0,CATEGORY_DESTROY,g1,1,0,0)
end
function c80100123.op(e,tp,eg,ep,ev,re,r,rp)
	local g=Duel.GetChainInfo(0,CHAININFO_TARGET_CARDS)
	local tg=g:Filter(Card.IsRelateToEffect,nil,e)
	if tg:GetCount()>0 then
		Duel.Destroy(tg,REASON_EFFECT)
	end
end